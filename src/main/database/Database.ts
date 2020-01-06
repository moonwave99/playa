import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import search from 'pouchdb-quick-search';

PouchDB.plugin(PouchFind);
PouchDB.plugin(search);

export interface Response {
  ok: boolean;
  id: string;
  rev: string;
}

export default class Database {
  protected db: any;  // eslint-disable-line
  constructor(databasePath: string, databaseName: string, debug: boolean){
    const LocalPouchDB = PouchDB.defaults({
      prefix: databasePath
    });
    this.db = new LocalPouchDB(databaseName);
    if (debug) {
      PouchDB.replicate(
        this.db,
        `http://localhost:5984/${databaseName}`,
        { live: true }
      );
    }
  }
}
