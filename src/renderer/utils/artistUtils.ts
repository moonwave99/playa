// duplicate from store/modules/album for tests
import { EntityHashMap } from './storeUtils';
import { Album } from '../store/modules/album';
import { Artist } from '../store/modules/library';
const VARIOUS_ARTISTS_ID = '_various-artists';
const VARIOUS_ARTISTS_LABEL = 'Various Artists';

export const NUMERIC_KEY = '#';
export const VARIOUS_ARTIST_KEY = 'V/A';
export const ALPHABET = [
  NUMERIC_KEY,
  ...'abcdefghijklmnopqrstuvwxyz'.split(''),
  VARIOUS_ARTIST_KEY
];

export function formatArtistName(name: string): string {
  return name === VARIOUS_ARTISTS_ID
    ? VARIOUS_ARTISTS_LABEL
    : name;
}

type updateArtistCountParams = {
  artists: EntityHashMap<Artist>;
  albums: Album[];
  action: 'add'|'remove';
}

export function updateArtistCount({
  artists,
  albums = [],
  action = 'add'
}: updateArtistCountParams): EntityHashMap<Artist> {
  return albums.reduce(
    (memo: EntityHashMap<Artist>, { artist }: Album) => {
      const foundArtist: Artist = memo[artist] || {
        _id: artist,
        name: artist,
        count: 0
      };
      return {
        ...memo,
        ...{ [artist]: {
          ...foundArtist,
          count: action === 'add' ? foundArtist.count + 1 : Math.max(0, foundArtist.count - 1)
        }}
      };
    }, artists
  );
}
