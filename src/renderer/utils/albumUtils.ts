import {
  Album,
  AlbumTypes,
  VARIOUS_ARTISTS_ID
} from '../store/modules/album';

const VARIOUS_ARTISTS_LABEL = 'V/A';
const ALBUM_TYPES_WITHOUT_TRACK_NUMBERS = [
  AlbumTypes.Remix,
  AlbumTypes.Various
];

export function showTrackArtists({ artist, type }: Album): boolean {
  return artist === VARIOUS_ARTISTS_ID || type === AlbumTypes.Remix;
}

export function showTrackNumbers({ type }: Album): boolean {
  return ALBUM_TYPES_WITHOUT_TRACK_NUMBERS.indexOf(type) < 0;
}

export function formatArtist({ artist }: Album): string {
  return artist === VARIOUS_ARTISTS_ID ? VARIOUS_ARTISTS_LABEL : artist;
}
