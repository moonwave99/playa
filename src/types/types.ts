import { Controllers, send } from '@/main/init';
// eslint-disable-next-line import/no-named-as-default
import Prisma, { ReleaseType } from '@prisma/client-generated';

type Artist = Prisma.Artist & {
  _type: 'artist',
  coverRelease?: ReleaseWithArtistAndSubreleases
};
type Release = Prisma.Release & { _type: 'release' };
type Collection = Prisma.Collection & {
  _type: 'collection',
  coverRelease?: ReleaseWithArtistAndSubreleases
};
type Track = Prisma.Track & { _type: 'track' };

export type { Artist, Release, Collection, Track, ReleaseType };

export type Entities = 'collection' | 'release' | 'artist' | 'searchResult' | 'track';
export type HasId = { id: number; };
export type HasTitle = { title: string; };

export type CollectionCreate = { title: string, releases?: number[] };
export type CollectionUpdate = { title: string, releases: number[] };
export type ArtistUpdate = Pick<Artist, 'name' | 'path'>;
export type TrackInfo = Pick<Track, 'path' | 'duration' | 'position' | 'title'>;
export type ReleaseCountByType = Record<ReleaseType, number>;
export type TrackWithRelease = Track & { release: ReleaseWithArtist };

export type WithReleases = {
  releases: ReleaseWithArtist[];
}

type WithReleasesAndSubreleases = {
  releases: ReleaseWithArtistAndSubreleases[];
}

type WithReleasesAndSubreleasesAndTracks = {
  releases: ReleaseWithArtistAndTracksAndSubreleases[];
}

type WithArtist = {
  artist: Artist;
}

type WithTracks = {
  tracks: Track[];
}

type WithCollections = {
  collections: Collection[];
}

export type WithRelatedArtists = {
  relatedArtists: Artist[];
}

export type ArtistWithRelatedArtists = Artist & WithRelatedArtists;
export type ArtistWithReleases = Artist & WithReleasesAndSubreleases;
export type ArtistWithReleasesFull = Artist & WithRelatedArtists & WithReleasesAndSubreleasesAndTracks;
export type CollectionWithReleases = Collection & WithReleasesAndSubreleasesAndTracks;
export type ReleaseWithArtist = Release & WithArtist;
export type ReleaseWithArtistAndSubreleases = Release & WithArtist & WithSubReleases;
export type ReleaseWithArtistAndTracks = Release & WithArtist & WithTracks;
export type ReleaseWithArtistAndTracksAndSubreleases = Release & WithArtist & WithTracks & WithSubReleases;
export type ReleaseWithArtistAndTracksAndSubreleasesAndCollections = Release & WithArtist & WithTracks & WithSubReleases & WithCollections;
export type ArtistWithReleaseCount = ArtistWithReleases & {
  releaseCount: ReleaseCountByType
};

export type WithSubReleases = {
  subReleases: ReleaseWithArtistAndTracks[];
}

export type Pagination = {
  take: number;
  skip: number;
  total: number;
}

export type WithPagination = {
  pagination: Pagination;
}

export type PaginatedResults<T> = WithPagination & {
  results: T[];
}

export type PaginationParams = {
  take?: number,
  skip?: number
}

export type SearchParams = Record<string, string>;

export type SearchResult = {
  id: number;
  type: Entities;
  title: string;
  hash: string;
  artist?: string;
  description: string;
  links: Record<Entities, string>;
  coverRelease?: ReleaseWithArtist;
}

export type Sidebars = "music" | "artists" | "collections";

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type ViewMode = 'grid' | 'list';

export type Settings = Record<string, string | number | boolean>;

export function withEntityType<T>(item: T | T[], _type: Entities): (T & { _type: Entities }) | (T & { _type: Entities })[] {
  if (Array.isArray(item)) {
    return item.map(x => ({ ...x, _type }));
  }
  return { ...item, _type }
}

export type NewReleaseInfo = {
  newPath: string;
  newDiscTitle: string;
  newTitle: string;
  newType: ReleaseType;
  newYear: number;
}

export type EditReleaseParam = (
  Pick<Release, 'id' | 'path' | 'hash' | 'title' | 'artist_id' | 'year' | 'type' | 'discTitle' | 'discNumber'>
  & NewReleaseInfo
);

export type MenuParams = {
  controllers: Controllers;
  send: typeof send;
};