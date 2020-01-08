import Database from './Database';
import { Album } from '../../renderer/store/modules/album';

interface Row {
  doc: Album;
  id: string;
  score: number;
}

export default class AlbumDatabase extends Database {
  async getList(ids: Album['_id'][]): Promise<Array<Album>> {
    const { rows } = await this.db.allDocs({
      keys: ids,
      include_docs: true, // eslint-disable-line
    });
    return rows.map((row: Row) => row.doc);
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
