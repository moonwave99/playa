import { Controllers, send } from "@/main/controllers/init";
// eslint-disable-next-line import/no-named-as-default
import Prisma, { ReleaseType } from "@prisma/client-generated";
import type { ICommonTagsResult } from "music-metadata/lib/type";

export { EntityType } from "@prisma/client-generated";

type Artist = Prisma.Artist & {
  entityType: "Artist";
  coverRelease?: ReleaseWithArtistAndSubReleases;
};
type Release = Prisma.Release & {
  entityType: "Release";
};

type Collection = Prisma.Collection & {
  entityType: "Collection";
  coverRelease?: ReleaseWithArtistAndSubReleases;
};
type Group = Prisma.Group & {
  entityType: "Group";
  coverArtist?: ArtistWithReleases;
};
type Track = Prisma.Track & {
  entityType: "Track";
};

export type { Artist, Release, Collection, Track, ReleaseType, Group };

export const releaseTypes: ReleaseType[] = [
  "Album",
  "EP",
  "Single",
  "Compilation",
  "Bootleg",
  "Various",
  "Tribute",
  "Soundtrack",
];

export type Entities =
  | "collection"
  | "release"
  | "artist"
  | "searchResult"
  | "track"
  | "group";
export type SearchableEntities =
  | "collection"
  | "release"
  | "artist"
  | "track"
  | "group";
export type Stats = Record<SearchableEntities, number>;
export type HasId = { id: number };
export type HasTitle = { title: string };

export type CollectionCreate = { title: string; releases?: number[] };
export type CollectionUpdate = { title: string; releases: number[] };
export type GroupCreate = { title: string; artists?: number[] };
export type GroupUpdate = { title: string; artists: number[] };
export type ArtistUpdate = Pick<Artist, "name" | "path">;
export type TrackInfo = Pick<
  Track,
  "path" | "duration" | "position" | "title" | "trackArtist"
> & {
  meta: ICommonTagsResult;
};
export type ReleaseCountByType = Record<ReleaseType, number>;
export type TrackWithRelease = Track & { release: ReleaseWithArtist };

export type WithReleases = {
  releases: ReleaseWithArtist[];
};

type WithReleasesAndSubreleases = {
  releases: ReleaseWithArtistAndSubReleases[];
};

type WithReleasesAndSubreleasesAndTracks = {
  releases: ReleaseWithArtistAndTracksAndSubreleases[];
};

type WithArtist = {
  artist: Artist;
};

type WithArtistsAndReleases = {
  artists: ArtistWithReleasesAndAppearances[];
};

type WithTracks = {
  tracks: Track[];
};

type WithCollections = {
  collections: Collection[];
};

export type WithCoverRelease = {
  coverRelease: Release;
};

export type WithGroups = {
  groups: Group[];
};

export type WithRelatedArtists = {
  relatedArtists: Artist[];
};

export type WithAdditionalArtists = {
  additionalArtists: Artist[];
};

export type WithAppearances = {
  appearsIn: ReleaseWithArtist[];
};

export type ArtistWithRelatedArtists = Artist & WithRelatedArtists;
export type ArtistWithReleases = Artist & WithReleasesAndSubreleases;
export type ArtistWithReleasesAndAppearances = Artist &
  WithReleasesAndSubreleases &
  WithAppearances;
export type ArtistWithReleasesFull = Artist &
  WithRelatedArtists &
  WithReleasesAndSubreleasesAndTracks &
  WithAppearances & { groups: Pick<Group, "id" | "title">[] };
export type CollectionWithReleases = Collection &
  WithReleasesAndSubreleasesAndTracks;
export type ReleaseWithArtist = Release & WithArtist & WithAdditionalArtists;
export type ReleaseWithArtistAndSubReleases = Release &
  WithArtist &
  WithAdditionalArtists &
  WithSubReleases;
export type ReleaseWithArtistAndTracks = Release &
  WithArtist &
  WithAdditionalArtists &
  WithTracks;
export type ReleaseWithArtistAndTracksAndSubreleases = Release &
  WithArtist &
  WithAdditionalArtists &
  WithTracks &
  WithSubReleases;
export type ReleaseWithArtistAndTracksAndSubreleasesAndCollections = Release &
  WithArtist &
  WithAdditionalArtists &
  WithTracks &
  WithSubReleases &
  WithCollections;
export type ArtistWithReleaseCount = ArtistWithReleases & {
  releaseCount: ReleaseCountByType;
};
export type GroupWithArtists = Group & WithArtistsAndReleases;

export type WithSubReleases = {
  subReleases: ReleaseWithArtistAndTracks[];
};

export type Pagination = {
  take: number;
  skip: number;
  total: number;
};

export type WithPagination = {
  pagination: Pagination;
};

export type PaginatedResults<T> = WithPagination & {
  results: T[];
};

export type PaginationParams = {
  take?: number;
  skip?: number;
};

export type SearchParams = Record<string, string>;

export type SearchResult = {
  entityType: "SearchResult";
  id: number;
  type: SearchableEntities;
  title: string;
  hash?: string;
  artist?: string;
  description: string;
  links: Partial<Record<Entities, string>>;
  coverRelease?: ReleaseWithArtist;
};

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type ReleaseListViewMode = "grid" | "list" | "compact";
export type ArtistsViewMode = "latest" | "alphabetical";

export type Settings = Record<string, string | number | boolean>;

export type NewReleaseInfo = {
  newPath: string;
  newDiscTitle: string;
  newTitle: string;
  newType: ReleaseType;
  newYear: number;
};

export type EditReleaseParam = Pick<
  Release,
  | "id"
  | "path"
  | "completePath"
  | "hash"
  | "title"
  | "artist_id"
  | "year"
  | "type"
  | "discTitle"
  | "discNumber"
> &
  NewReleaseInfo;

export type MenuParams = {
  controllers: Controllers;
  send: typeof send;
};

export type Context = {
  id?: number;
  entityType: "Artist" | "Collection" | "Group" | null;
};

export type Unpacked<T> = T extends (infer U)[] ? U : T;

export type BaseQuery = {
  isPending: boolean;
  error: Error;
};

export type Notification = {
  type: "success" | "info" | "warning" | "error";
  message: string;
};

export type ImportData = {
  artist: Pick<Artist, "id" | "name">;
  title: string;
  year: number;
  completePath: string;
  path: string;
  type: ReleaseType;
  discNumber?: number;
  tracks: TrackInfo[];
};
