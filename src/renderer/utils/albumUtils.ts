import {
  Album,
  AlbumTypes
} from '../store/modules/album';

import {
  Artist
} from '../store/modules/artist';

const VARIOUS_ARTISTS_LABEL = 'V/A';
const ALBUM_TYPES_WITHOUT_TRACK_NUMBERS = [
  AlbumTypes.Remix,
  AlbumTypes.Various
];

export function showTrackArtists({ isFromVA, type }: Album): boolean {
  return isFromVA || type === AlbumTypes.Remix;
}

export function showTrackNumbers({ type }: Album): boolean {
  return ALBUM_TYPES_WITHOUT_TRACK_NUMBERS.indexOf(type) < 0;
}

export function formatArtist({ album, artist }: { album: Album; artist: Artist }): string {
  return album.isFromVA ? VARIOUS_ARTISTS_LABEL : artist.name;
}
