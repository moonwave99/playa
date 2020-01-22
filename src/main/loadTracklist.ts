import { parseFile, IAudioMetadata } from 'music-metadata';
import Database from './database';
import { Track, getDefaultTrack } from '../renderer/store/modules/track';

interface MetadataResult {
  _id: string;
  metadata?: IAudioMetadata;
  status: TrackStatus;
}

enum TrackStatus {
  OK,
  NOT_FOUND
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

export default async function loadTracklist(
  ids: string[],
  db: Database,
  forceUpdate = false
): Promise<Track[]> {
  const results = await db.getList<Track>(ids);
  if (forceUpdate) {
    await db.removeBulk(results);
  } else if (results.length > 0) {
    return results;
  }

  const meta = await loadMetadata(ids);
  const loadedTracks = meta.map(({ _id, metadata, status }) => {
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
      ...getDefaultTrack(),
      _id,
      path: _id
    }
  });
  await db.saveBulk<Track>(
    loadedTracks.filter(({ found }) => found)
  );
  return loadedTracks;
}
