import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import search from 'pouchdb-quick-search';

PouchDB.plugin(PouchFind);
PouchDB.plugin(search);

interface Entity {
  _id: string;
  _rev: string;
  _deleted?: boolean;
}

interface Row {
  doc: Entity;
  id: string;
  score: number;
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

  async find(query: string, fields: string[]): Promise<Array<Entity>> {
    const { rows } = await this.db.search({
      query: query,
      fields,
      include_docs: true, // eslint-disable-line
      highlighting: true
    });
    return rows.map((row: Row) => row.doc);
  }

  async findAll(): Promise<Array<Entity>> {
    const { rows } = await this.db.allDocs({
      include_docs: true, // eslint-disable-line
    });
    return rows.map((row: Row) => row.doc);
  }

  async get<T>(_id: string): Promise<T> {
    let doc;
    try {
      doc = await this.db.get(_id);
    } catch (error) {
      if (error.name === 'not_found') {
        doc = {};
      } else {
        throw error;
      }
    }
    return doc;
  }

  async getList(ids: Entity['_id'][]): Promise<Array<Entity>> {
    const { rows } = await this.db.allDocs({
      keys: ids,
      include_docs: true, // eslint-disable-line
    });
    return rows.map((row: Row) => row.doc);
  }

  async save<T extends Entity>(entity: T): Promise<Entity> {
    const { _id, _rev, ...other } = entity;
    const doc: Entity = await this.get(_id);
    let payload;
    if (doc._rev) {
      payload = { ...other, _id, _rev: doc._rev };
    } else {
      payload = { ...other, _id };
    }
    const response = await this.db.put(payload);
    if (response.ok === true) {
      return Promise.resolve({ ...entity, _rev: response.rev });
    }
    throw new Error(`Problems persisting entity: ${_id} - ${_rev}`);
  }
  
  async delete<T extends Entity>(entity: T): Promise<Entity> {
    const doc: Entity = await this.get(entity._id);
    doc._deleted = true;
    const response = await this.db.put(doc);
    if (response.ok === true) {
      return Promise.resolve({ ...doc, _rev: response.rev });
    }
    throw new Error(`Problems deleting entity: ${doc._id} - ${doc._rev}`);
  }
}
