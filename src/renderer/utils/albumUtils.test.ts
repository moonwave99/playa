import { Artist } from '../store/modules/artist';
import { Album } from '../store/modules/Album';
import {
  showTrackArtists,
  showTrackNumbers,
  formatArtist,
  groupAlbumsByType
} from './albumUtils';

jest.mock('electron', () => ({}));

describe('showTrackArtists', () => {
  it('should return true if album is from V/A or is of type remix', () => {
    expect(showTrackArtists({ isAlbumFromVA: true } as Album)).toBe(true);
    expect(showTrackArtists({ type: 'remix' } as Album)).toBe(true);
  });
});

describe('showTrackNumbers', () => {
  it('should return true if album is of type remix or various', () => {
    expect(showTrackNumbers({ type: 'remix' } as Album)).toBe(false);
    expect(showTrackNumbers({ type: 'various' } as Album)).toBe(false);
  });
});

describe('formatArtist', () => {
  it('should return the artist name if album is not from various artists', () => {
    expect(formatArtist({
      album: { isAlbumFromVA: false } as Album,
      artist: { name: 'Slowdive' } as Artist
    })).toBe('Slowdive');
  });

  it('should return V/A if album is from various artists', () => {
    expect(formatArtist({
      album: { isAlbumFromVA: true } as Album,
      artist: null as Artist
    })).toBe('V/A');
  });
});

describe('groupAlbumsByType', () => {
  it('should return an empty object if no albums are passed', () => {
    expect(groupAlbumsByType()).toEqual({});
  });
  it('should return an EntityHashMap of albums grouped by type', () => {
    const albums = [
      { type: 'album' },
      { type: 'album' },
      { type: 'ep' }
    ] as Album[];
    expect(groupAlbumsByType(albums)).toEqual({
      album: [albums[0], albums[1]],
      ep: [albums[2]]
    });
  });
});
