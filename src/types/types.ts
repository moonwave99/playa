import type { Artist, Release, Collection, Note, ReleaseType, Track } from '@prisma/client-generated';
export type { Artist, Release, Collection, Note, ReleaseType, Track } from '@prisma/client-generated';

export type Entities = 'collection' | 'release' | 'artist' | 'note' | 'searchResult' | 'track';
export type HasId = { id: number; };
export type HasTitle = { title: string; };

export type CollectionCreate = { title: string, releases?: number[] };
export type CollectionUpdate = { title: string, releases: number[] };
export type ArtistUpdate = Pick<Artist, 'name' | 'path'>;
export type TrackInfo = Pick<Track, 'path' | 'duration' | 'position' | 'title'>;
export type ReleaseCountByType = Record<ReleaseType, number>;
export type NoteUpdate = { title: string, content: string, artists: number[], releases: number[] };
export type NoteCreate = { title: string, content: string, artists: number[], releases: number[] };

type WithReleases = {
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

type WithArtists = {
  artists: Artist[];
}

export type ArtistWithReleases = Artist & WithReleasesAndSubreleases;
export type CollectionWithReleases = Collection & WithReleasesAndSubreleasesAndTracks;
export type ReleaseWithArtist = Release & WithArtist;
export type ReleaseWithArtistAndSubreleases = Release & WithArtist & WithSubReleases;
export type ReleaseWithArtistAndTracks = Release & WithArtist & WithTracks;
export type ReleaseWithArtistAndTracksAndSubreleases = Release & WithArtist & WithTracks & WithSubReleases;
export type ArtistWithReleaseCount = ArtistWithReleases & {
  releaseCount: ReleaseCountByType
};
export type NoteWithEntities = Note & WithReleases & WithArtists;

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
}

export type Sidebars = "music" | "artists" | "collections";

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type ViewMode = 'grid' | 'list';