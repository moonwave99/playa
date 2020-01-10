import { Album } from '../src/renderer/store/modules/album';
import { Track } from '../src/renderer/store/modules/track';

export const albums: Array<Album> = [
  {
    _id: '1',
    artist: 'Slowdive',
    title: 'Just For a Day',
    year: 1991,
    type: 'album',
    created: new Date('2020-01-01'),
    path: '/path/to/album_1',
    tracks: []
  },
  {
    _id: '2',
    artist: 'My Bloody Valentine',
    title: 'Loveless',
    year: 1991,
    type: 'album',
    created: new Date('2020-02-02'),
    path: '/path/to/album_2',
    tracks: []
  }
];

export const tracks: Array<Track> = [
  
];
