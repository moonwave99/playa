import loadTracklist from './loadTracklist';
import Database from './database';
import { tracks } from '../../../test/testFixtures';
import { Track } from '../../renderer/store/modules/track';

describe('loadTracklist', () => {
  const db = new Database({
    path: '/path/to/db',
    name: 'track'
  });

  it('should load track info from database by given ids', async () => {
    const { tracks: tracklist } = await loadTracklist([
      '/path/to/track_1.mp3',
      '/path/to/track_2.mp3'
    ], db);
    expect(tracklist[0]).toEqual(tracks[0]);
    expect(tracklist[1]).toEqual(tracks[1]);
  });

  it('should load track info from disk by given ids', async () => {
    const { tracks: tracklist } = await loadTracklist([
      '/path/to/track_3.mp3',
      '/path/to/track_4.mp3'
    ], db);
    expect(tracklist[0]).toEqual(tracks[2]);
    expect(tracklist[1]).toEqual(tracks[3]);
  });

  it('should return the default track for not found files', async () => {
    const { tracks: tracklist } = await loadTracklist([
      '/path/to/track_3.mp3',
      '/path/to/track_5.mp3'
    ], db);
    expect(tracklist[0]).toEqual(tracks[2]);
    expect(tracklist[1]).toEqual({
      _id: '/path/to/track_5.mp3',
      artist: '',
      title: '',
      duration: null,
      found: false,
      number: null,
      path: '/path/to/track_5.mp3'
    });
  });

  it('should update database if persist == true', async () => {
    const db = new Database({
      path: '/path/to/db',
      name: 'track'
    });
    const ids = [
      '/path/to/track_3.mp3',
      '/path/to/track_4.mp3'
    ];
    const { tracks: tracklist } = await loadTracklist(ids, db, true, true);
    const results = await db.getList<Track>(ids);
    expect(results[0]).toEqual(tracklist[0]);
    expect(results[1]).toEqual(tracklist[1]);
  });

  it('should return the album name of the first track if present', async () => {
    const { albumTitle } = await loadTracklist([
      '/path/to/track_3.mp3',
      '/path/to/track_4.mp3'
    ], db, true);
    expect(albumTitle).toBeTruthy();
  });
});
