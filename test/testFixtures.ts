import { Playlist } from '../src/renderer/store/modules/playlist';
import { Album, AlbumTypes } from '../src/renderer/store/modules/album';
import { Track } from '../src/renderer/store/modules/track';
import { Artist } from '../src/renderer/store/modules/artist';

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
    _rev: null,
    artist: 'Slowdive',
    title: 'Just For a Day',
    year: 1991,
    type: AlbumTypes.Album,
    created: createDatesList[0],
    path: '/path/to/album_1',
    tracks: []
  },
  {
    _id: '2',
    _rev: null,
    artist: 'My Bloody Valentine',
    title: 'Loveless',
    year: 1991,
    type: AlbumTypes.Album,
    created: createDatesList[1],
    path: '/path/to/album_2',
    tracks: []
  }
];

export const tracks: Track[] = [
  {
    _id: '/path/to/track_1.mp3',
    path: '/path/to/track_1.mp3',
    found: true,
    artist: 'Slowdive',
    title: 'Spanish Air',
    number: 1,
    duration: 123
  },
  {
    _id: '/path/to/track_2.mp3',
    path: '/path/to/track_2.mp3',
    found: true,
    artist: 'Slowdive',
    title: "Celia's Dream",
    number: 2,
    duration: 456
  },
  {
    _id: '/path/to/track_3.mp3',
    path: '/path/to/track_3.mp3',
    found: true,
    artist: 'My Bloody Valentine',
    title: 'Only Shallow',
    number: 1,
    duration: 123
  },
  {
    _id: '/path/to/track_4.mp3',
    path: '/path/to/track_4.mp3',
    found: true,
    artist: 'My Bloody Valentine',
    title: "Loomer",
    number: 2,
    duration: 456
  }
];

export const artists: Artist[] = [
  {
    _id: '883',
    _rev: null,
    name: '883',
    count: 1
  },
  {
    _id: 'Adorable',
    _rev: null,
    name: 'Adorable',
    count: 1
  },
  {
    _id: 'Slowdive',
    _rev: null,
    name: 'Slowdive',
    count: 1
  },
  {
    _id: 'My Bloody Valentine',
    _rev: null,
    name: 'My Bloody Valentine',
    count: 1
  },
  {
    _id: '_various-artists',
    _rev: null,
    name: '_various-artists',
    count: 10
  }
];
