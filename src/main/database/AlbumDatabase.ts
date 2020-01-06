import Database from './Database';
import { Album } from '../../interfaces';

interface Row {
  doc: Album;
  id: string;
  score: number;
}

export default class AlbumDatabase extends Database {
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
