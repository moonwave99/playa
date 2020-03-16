import { artists } from '../../../test/testFixtures';
import { toObj } from './storeUtils';
import { Album } from '../store/modules/album';
import { formatArtistName, updateArtistCount } from './artistUtils';

describe('formatArtistName', () => {
  it('should format the artist name', () => {
    expect(formatArtistName('Slowdive')).toBe('Slowdive');
    expect(formatArtistName('_various-artists')).toBe('Various Artists');
  });
});

describe('updateArtistCount', () => {
  it('should return an updated hash of artists', () => {
    const artistsHash = toObj(artists);
    const updatedArtists = updateArtistCount({
      artists: artistsHash,
      albums: [{ artist: 'Slowdive' }] as Album[],
      action: 'add'
    });
    expect(updatedArtists).toEqual({
      ...artistsHash,
      'Slowdive':   {
        _id: 'Slowdive',
        _rev: null,
        name: 'Slowdive',
        count: 2
      }
    });
  });

  it('should not go below 0', () => {
    const artistsHash = toObj(artists);
    const updatedArtists = updateArtistCount({
      artists: artistsHash,
      albums: [
        { artist: 'Slowdive' },
        { artist: 'Slowdive' }
      ] as Album[],
      action: 'remove'
    });
    expect(updatedArtists).toEqual({
      ...artistsHash,
      'Slowdive':   {
        _id: 'Slowdive',
        _rev: null,
        name: 'Slowdive',
        count: 0
      }
    });
  });

  it('should add artist if not present', () => {
    const artistsHash = toObj(artists);
    const updatedArtists = updateArtistCount({
      artists: artistsHash,
      albums: [{ artist: 'Ride' }] as Album[],
      action: 'add'
    });
    expect(updatedArtists).toEqual({
      ...artistsHash,
      'Ride':   {
        _id: 'Ride',
        name: 'Ride',
        count: 1
      }
    });
  });
});
