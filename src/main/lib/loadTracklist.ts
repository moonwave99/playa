import { parseFile, IAudioMetadata } from 'music-metadata';
import Database from './database';
import { Track, getDefaultTrack } from '../../renderer/store/modules/track';

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

function getAlbumTitle(metadata: MetadataResult[]): string {
  if (!metadata.length) {
    return '';
  }
  if (!metadata[0].metadata) {
    return '';
  }
  return metadata[0].metadata.common.album || '';
}

export default async function loadTracklist(
  ids: string[],
  db: Database,
  forceUpdate = false,
  persist = true
): Promise<{
  tracks: Track[];
  albumTitle: string;
}> {
  const results = await db.getList<Track>(ids);
  let resultIDs = results.map(({ _id }) => _id);
  if (forceUpdate) {
    await db.removeBulk(results);
    resultIDs = [];
  }
  const tracksNotInDB = ids.filter(id => resultIDs.indexOf(id) < 0);
  const meta = await loadMetadata(tracksNotInDB);
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
  if (persist) {
    await db.saveBulk<Track>(
      loadedTracks.filter(({ found }) => found)
    );
  }
  return {
    tracks: [
      ...results,
      ...loadedTracks
    ].sort((a, b) => a._id.localeCompare(b._id)),
    albumTitle: getAlbumTitle(meta)
  }
}
