import { playlists, albums } from '../testFixtures';
import { toObj, toArray, EntityHashMap } from '../../src/renderer/utils/storeUtils';
import { Album } from '../../src/renderer/store/modules/album';
import { Playlist } from '../../src/renderer/store/modules/playlist';

const db: { [key: string]: any} = {
  playlist: toObj(playlists) as EntityHashMap<Playlist>,
  album: toObj(albums) as EntityHashMap<Album>,
};

interface A {
  [key: string]: any;
  [key: number]: any;
}

class LocalPouchDB {
  private name: string;
  constructor(name: string){
    this.name = name;
  }
  async allDocs({ keys }: { keys?: string[] }): Promise<{ rows: object[] }> {
    if (!keys) {
      return Promise.resolve({
        rows: toArray<{ _deleted?: boolean }>(db[this.name])
          .filter(x => !x._deleted)
          .map(x => ({ doc: x }))
      });
    }
    return Promise.resolve({
      rows: keys.map(id => db[this.name][id])
        .filter(x => !x._deleted)
        .map(x => ({ doc: x }))
    });
  }
  async get(_id: string): Promise<object> {
    const result = db[this.name][_id];
    if (!result || result._deleted) {
      return Promise.resolve({});
    }
    return Promise.resolve(result);
  }
  async createIndex() { true }
  async put({ _id, _deleted }: { _id: string, _deleted?: boolean }) {
    if (_deleted === true) {
      delete db[this.name][_id];
    }
    return _id === '1' ? {
      ok: true,
      rev: '123'
    } : {
      ok: false
    };
  }
  async search({ query, fields }: { query: string, fields: string[] }) {
    return {
      rows: toArray<A>(db[this.name]).filter(x => {
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
  async find({ selector }: { [key: string]: any }) {
    const keys = Object.keys(selector);
    return {
      docs: toArray<A>(db[this.name]).filter(
        x => keys.every(key => x[key] === selector[key])
      )
    };
  }
  async remove(doc: { _id: string }) {
    delete db[this.name][doc._id];
  }
  async bulkDocs(docs: { _id: string }[]) {
    docs.forEach(doc => db[this.name][doc._id] = doc);
  }
}

class PoubchDB {
  constructor(){}
  static plugin() { true }
  static defaults() { return LocalPouchDB }
}

module.exports = PoubchDB;
