import { parseFile, IAudioMetadata } from 'music-metadata';
import Database from './database';
import { Track } from '../renderer/store/modules/track';

interface MetadataResult {
  _id: string;
  metadata?: IAudioMetadata;
  status: string;
}

enum TrackStatus {
  OK = 'OK',
  NOT_FOUND = 'NOT_FOUND'
}

async function loadMetadata(paths: string[]): Promise<MetadataResult[]> {
  return Promise.all(
    paths.map(async (path) => {
      try {
        const metadata = await parseFile(path, { skipCovers: true, duration: true });
        return {
          _id: path,
          metadata,
          status: TrackStatus.OK
        };
      }
      catch (e) {
        return {
          _id: path,
          status: TrackStatus.NOT_FOUND
        };
      }
    })
  );
}

// #TODO:
// 1. persist tracks in db cache;
// 2. handle errors;
// 3. test the thing.
export default async function loadTracklist(ids: string[], db: Database): Promise<Track[]> {
  const results = await db.getList<Track>(ids);
  if (results.length > 0) {
    return results;
  }
  const meta = await loadMetadata(ids);
  return meta.map(({ _id, metadata, status }) => {
    if (status === TrackStatus.OK) {
      const { duration } = metadata.format;
      const { title, artist, track } = metadata.common;
      return {
        _id,
        path: _id,
        found: true,
        artist,
        title,
        number: track.no,
        duration
      };
    }
    return {
      _id,
      path: _id,
      found: false,
      artist: null,
      title: null,
      number: null,
      duration: null
    }
  });
}
