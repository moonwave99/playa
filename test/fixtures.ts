import { Playlist } from '../src/renderer/store/modules/playlist';
import { Album } from '../src/renderer/store/modules/album';
import { Track } from '../src/renderer/store/modules/track';

const createDatesList = [1,2,3].map(x => new Date(`2020-01-0${x}`).toISOString());

export const playlists: Playlist[] = [
  {
    _id: '1',
    _rev: null,
    title: 'New Playlist 1',
    created: createDatesList[0],
    accessed: createDatesList[0],
    albums: [] as string[]
  },
  {
    _id: '2',
    _rev: null,
    title: 'New Playlist 2',
    created: createDatesList[1],
    accessed: createDatesList[1],
    albums: [] as string[]
  },
];

export const albums: Album[] = [
  {
    _id: '1',
    artist: 'Slowdive',
    title: 'Just For a Day',
    year: 1991,
    type: 'album',
    created: createDatesList[0],
    path: '/path/to/album_1',
    tracks: []
  },
  {
    _id: '2',
    artist: 'My Bloody Valentine',
    title: 'Loveless',
    year: 1991,
    type: 'album',
    created: createDatesList[1],
    path: '/path/to/album_2',
    tracks: []
  }
];

export const tracks: Track[] = [{
  _id: '1',
  path: '/path/to/track_1',
  found: true,
  artist: 'Slowdive',
  title: 'Spanish Air',
  number: 1,
  duration: 123
}];
