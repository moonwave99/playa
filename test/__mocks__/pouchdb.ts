import { playlists, albums, tracks } from '../testFixtures';
import { toObj, toArray, EntityHashMap } from '../../src/renderer/utils/storeUtils';
import { Album } from '../../src/renderer/store/modules/album';
import { Playlist } from '../../src/renderer/store/modules/playlist';
import { Track } from '../../src/renderer/store/modules/track';

interface A {
  [key: string]: any;
  [key: number]: any;
}

type FindParams = {
  selector: { [key: string]: any };
  sort: { [key: string]: any }[];
  limit: number;
};

class PouchError extends Error {
  public name: string;
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

class LocalPouchDB {
  private name: string;
  private db: { [key: string]: any };
  private views: any;
  constructor(name: string){
    this.name = name;
    this.db = {
      playlist: toObj(playlists) as EntityHashMap<Playlist>,
      album: toObj(albums) as EntityHashMap<Album>,
      track: toObj([tracks[0], tracks[1]]) as EntityHashMap<Track>
    };
    this.views = {};
  }
  async allDocs({ keys }: { keys?: string[] }): Promise<{ rows: object[] }> {
    if (!keys) {
      return Promise.resolve({
        rows: toArray<{ _deleted?: boolean }>(this.db[this.name])
          .filter(x => !x._deleted)
          .map(x => ({ doc: x }))
      });
    }
    return Promise.resolve({
      rows: keys.map(id => this.db[this.name][id])
        .filter(x => !(x || {})._deleted)
        .map(x => ({ doc: x }))
    });
  }
  async get(_id: string): Promise<object> {
    const result = this.db[this.name][_id];
    if (!result || result._deleted) {
      throw new PouchError(`Record ${_id} not found`, 'not_found');
    }
    return Promise.resolve(result);
  }
  async createIndex() { true }
  async put({ _id, _rev, _deleted, ...entity }: { _id: string, _rev?: string, _deleted?: boolean, entity: object }) {
    if (_id.startsWith('_design')) {
      this.views[_id] = { _id, ...entity };
      return;
    }
    if (!this.db[this.name][_id]) {
      const newId = '1';
      this.db[this.name][newId] = {
        ...entity,
        _id: newId,
        _rev: '0'
      };
      return {
        ok: true,
        rev: '0'
      }
    }
    const newRev = `${+(_rev || '0') + 1}`;
    if (_deleted === true) {
      delete this.db[this.name][_id];
    }
    if (_id === '1') {
      this.db[this.name][_id] = {
        ...entity,
        _rev: newRev
      };
      return {
        ok: true,
        rev: newRev
      };
    } else {
      return {
        ok: false
      };
    }
  }
  async search({ query, fields }: { query: string, fields: string[] }) {
    return {
      rows: toArray<A>(this.db[this.name]).filter(x => {
        let found = false;
        fields.forEach(field => {
          if (x[field].indexOf(query) > 0) {
            found = true;
          }
        });
        return found;
      }).map(x => ({ doc: x }))
    };
  }
  async find({
    selector,
    sort = [],
    limit = 0
  }: FindParams) {
    const keys = Object.keys(selector);
    let docs = toArray<A>(this.db[this.name]).filter(
      x => keys.every(key => {
        switch(typeof selector[key]) {
          case 'string':
            return x[key] === selector[key];
          case 'object':
            for (let [k, v] of Object.entries(selector[key])) {
              if (k === '$lte') {
                return x[key] <= v;
              }
            }
            break;
        }
      })
    );
    if (sort.length > 0) {
      const [sortField, order] = Object.entries(sort[0])[0];
      docs.sort((a, b): number => {
        if (a[sortField] > b[sortField]) {
          return order === 'asc' ? -1 : 1;
        }
        if (a[sortField] < b[sortField]) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    if (limit > 0) {
      docs = docs.slice(0, limit);
    }

    return { docs };
  }
  async remove(doc: { _id: string }) {
    delete this.db[this.name][doc._id];
  }
  async bulkDocs(docs: { _id: string }[]) {
    docs.forEach(doc => this.db[this.name][doc._id] = doc);
  }
  async query(queryName: string, _options: object) {
    const [, view] = queryName.split('/');
    const rows = toArray<A>(this.db[this.name])
      .map(doc => ({
        key: doc[view.replace('groupCountBy', '').toLowerCase()],
        value: 1
      }))
      .reduce((
        memo: { [key: string]: number},
        { key, value } : { key: string; value: number }
      ) => {
        if (!memo[key]) {
          memo[key] = 0;
        }
        memo[key] += value
        return memo;
      }, {});
    return { rows };
  }
  async close() {
    return true;
  }
}

class PoubchDB {
  constructor(){}
  static plugin() { true }
  static defaults() { return LocalPouchDB }
  static replicate = jest.fn()
}

module.exports = PoubchDB;
