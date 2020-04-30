import * as Path from 'path';
import * as fs from 'fs-extra';
import Database from '../../src/main/lib/database';
import { SPECTRON_BASEPATH } from './appUtils'

type TestPlaylist = {
  _id: string;
  _rev: string;
  title: string;
  created: string;
  accessed: string;
  albums: TestAlbum['_id'][];
}

type TestAlbum = {
  _id: string;
  _rev: string;
  artist: string;
  title: string;
  year?: number;
  isAlbumFromVA?: boolean;
  type: string;
  created: string;
  path: string;
  tracks: TestTrack['_id'][];
}

type TestArtist = {
  _id: string;
  _rev: string;
  name: string;
}

export type TestTrack = {
  _id: string;
  _rev: string;
  path: string;
  found?: boolean;
  artist: string;
  title: string;
  number: number;
  duration: number;
}

export const TestPlaylists: TestPlaylist[] = [
  {
    _id: '1',
    _rev: null,
    title: 'New Playlist 1',
    created: null,
    accessed: null,
    albums: []
  },
  {
    _id: '2',
    _rev: null,
    title: 'New Playlist 2',
    created: null,
    accessed: null,
    albums: []
  }
];


export const TestAlbums: TestAlbum[] = [
  {
    _id: '1',
    _rev: null,
    path: '/path/to/album/1',
    title: 'Just for a day',
    year: 1991,
    type: 'album',
    artist: '1',
    created: null,
    tracks: []
  },
  {
    _id: '2',
    _rev: null,
    path: '/path/to/album/2',
    title: 'Loveless',
    year: 1991,
    type: 'album',
    artist: '2',
    created: null,
    tracks: []
  }
];

export const TestArtists: TestArtist[] = [
  {
    _id: '1',
    _rev: null,
    name: 'Slowdive'
  },
  {
    _id: '2',
    _rev: null,
    name: 'My Bloody Valentine'
  }
];

const DB_PATH = Path.join(SPECTRON_BASEPATH, 'databases');

async function prepareDir(): Promise<void> {
  await fs.remove(DB_PATH);
  await fs.ensureDir(DB_PATH);
}

type PopulateTestDBParams = {
  playlists: TestPlaylist[];
  albums: TestAlbum[];
  artists: TestArtist[];
  tracks: TestTrack[];
}

export async function populateTestDB({
  playlists = [],
  albums = [],
  artists = [],
  tracks = []
}: PopulateTestDBParams = {
  playlists: [],
  albums: [],
  artists: [],
  tracks: []
}): Promise<void> {
  await prepareDir();
  const entities = ['playlist', 'album', 'artist', 'track'];

  const db: { [key: string]: Database }
    = entities.reduce((memo, key) =>
      ({ ...memo, [key]: new Database({ path: DB_PATH + Path.sep, name: key })})
    , {});

  await Promise.all(playlists.map(async playlist => {
    const now = new Date().toISOString();
    return await db.playlist.save<TestPlaylist>({
      ...playlist,
      created: now,
      accessed: now
    });
  }));

  await Promise.all(albums.map(async album => {
    const now = new Date().toISOString();
    return await db.album.save<TestAlbum>({
      ...album,
      created: now
    });
  }));

  await Promise.all(artists.map(
    async artist => await db.artist.save<TestArtist>(artist)
  ));

  await Promise.all(tracks.map(
    async track => await db.track.save<TestTrack>(track))
  );

  await db.playlist.close();
  await db.album.close();
  await db.artist.close();
  await db.track.close();
}
