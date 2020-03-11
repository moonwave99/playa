// duplicate from store/modules/album for tests
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
