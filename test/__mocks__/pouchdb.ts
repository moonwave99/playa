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

class LocalPouchDB {
  private name: string;
  private db: { [key: string]: any };
  constructor(name: string){
    this.name = name;
    this.db = {
      playlist: toObj(playlists) as EntityHashMap<Playlist>,
      album: toObj(albums) as EntityHashMap<Album>,
      track: toObj([tracks[0], tracks[1]]) as EntityHashMap<Track>
    };
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
      return Promise.resolve({});
    }
    return Promise.resolve(result);
  }
  async createIndex() { true }
  async put({ _id, _deleted }: { _id: string, _deleted?: boolean }) {
    const newRev = `${+(this.db[this.name][_id]._rev)++}`;
    if (_deleted === true) {
      delete this.db[this.name][_id];
    }
    return _id === '1' ? {
      ok: true,
      rev: newRev
    } : {
      ok: false
    };
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
              if (k === '$gte') {
                return x[key] >= v;
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
}

class PoubchDB {
  constructor(){}
  static plugin() { true }
  static defaults() { return LocalPouchDB }
  static replicate = jest.fn()
}

module.exports = PoubchDB;
