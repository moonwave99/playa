import Database from './Database';
import { Playlist } from '../../renderer/store/modules/playlists';

interface Row {
  doc: SerializedPlaylist;
  id: string;
  score: number;
}

interface SerializedPlaylist {
  _id: string;
  _rev: string;
  title: string;
  created: string;
  accessed: string;
  albums: string[];
  _deleted?: boolean;
}

function serialize(playlist: Playlist): SerializedPlaylist {
  const { _id, _rev, title, created, accessed, albums } = playlist;
  return {
    _id,
    _rev,
    title,
    created,
    accessed,
    albums
  }
}

function deserialize(playlist: SerializedPlaylist): Playlist {
  const { _id, _rev, title, created, accessed, albums } = playlist;
  return {
    _id,
    _rev,
    title,
    created,
    accessed,
    albums
  }
}

export default class PlaylistDatabase extends Database {
  async get(_id: string): Promise<SerializedPlaylist> {
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
  async findAll(): Promise<Array<Playlist>> {
    const { rows } = await this.db.allDocs({
      include_docs: true, // eslint-disable-line
    });
    return rows.map((row: Row) => row.doc);
  }
  async find(query: string): Promise<Array<Playlist>> {
    const { rows } = await this.db.search({
      query: query,
      fields: ['title'],
      include_docs: true, // eslint-disable-line
      highlighting: true
    });
    return rows.map((row: Row) => deserialize(row.doc));
  }
  async save(playlist: Playlist): Promise<Playlist> {
    const { _id, _rev, ...other } = playlist;
    const doc = await this.get(_id);
    let payload;
    if (doc._rev) {
      payload = { ...other, _id, _rev: doc._rev };
    } else {
      payload = { ...other, _id };
    }
    const response = await this.db.put(serialize(payload));
    if (response.ok === true) {
      return Promise.resolve({ ...playlist, _rev: response.rev });
    }
    throw new Error(`Problems persisting playlist: ${playlist.title} - ${_id} - ${_rev}`);
  }
  async delete(playlist: Playlist): Promise<Playlist> {
    const doc = await this.get(playlist._id);
    doc._deleted = true;
    const response = await this.db.put(doc);
    if (response.ok === true) {
      return Promise.resolve({ ...deserialize(doc), _rev: response.rev });
    }
    throw new Error(`Problems deleting playlist: ${doc.title} - ${doc._id} - ${doc._rev}`);
  }
}
