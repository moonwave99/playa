import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import search from 'pouchdb-quick-search';
import { Album } from '../interfaces';

PouchDB.plugin(PouchFind);
PouchDB.plugin(search);

interface Row {
  doc: Album;
  id: string;
  score: number;
}

export default class Database {
  private db: any;  // eslint-disable-line
  constructor(databasePath: string, databaseName: string){
    const LocalPouchDB = PouchDB.defaults({
      prefix: databasePath
    });
    this.db = new LocalPouchDB(databaseName);
  }
  async find(query: string): Promise<Array<Album>> {
    const { rows } = await this.db.search({
      query: query,
      fields: ['artist', 'title'],
      include_docs: true, // eslint-disable-line
      highlighting: true
    });
    return rows.map((row: Row) => row.doc);
  }
}
