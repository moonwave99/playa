import prisma from "./prisma";
import type {
  SearchableEntities,
  SearchResult,
  HasTitle,
  ReleaseWithArtistAndSubReleases,
  CollectionWithReleases,
  ArtistWithReleases,
  TrackWithRelease,
  GroupWithArtists,
  WithAdditionalArtists,
  ReleaseWithArtist,
  Unpacked,
} from "@/types/types";
import {
  getCoverRelease,
  getReleaseTitle,
  getReleaseArtist,
  sortByQueryPosition,
  normalizeArtistDisplayName,
  VARIOUS_ARTISTS_NAME,
} from "@/lib/utils";

type GetSearchResultParams = {
  query: string;
  take?: number;
  type?: SearchableEntities;
};

export async function getSearchResults({
  query,
  take = 20,
  type,
}: GetSearchResultParams): Promise<SearchResult[]> {
  const types = (type ? [type] : Object.keys(getters)) as SearchableEntities[];
  const data = await Promise.all(
    types.map(async (type) => {
      const results = await getters[type](query, take);
      const transformer = transformers[type] as (
        x: Unpacked<typeof results>
      ) => SearchResult;
      return results
        .map(transformer)
        .toSorted((a: HasTitle, b: HasTitle) =>
          sortByQueryPosition(query, "title", a, b)
        );
    })
  );

  return data.flat();
}

type Getter<T> = (query: string, take: number) => Promise<T[]>;

type Getters = {
  artist: Getter<ArtistWithReleases>;
  release: Getter<ReleaseWithArtist>;
  track: Getter<TrackWithRelease>;
  collection: Getter<CollectionWithReleases>;
  group: Getter<GroupWithArtists>;
};

const getters: Getters = {
  artist: (query: string, take: number) =>
    prisma.artist.findMany({
      take,
      where: {
        OR: [
          {
            normalizedName: {
              contains: query,
            },
          },
          {
            appearsIn: {
              some: {
                normalizedTitle: {
                  contains: query,
                },
              },
            },
          },
        ],
      },
      include: {
        coverRelease: {
          include: {
            artist: true,
          },
        },
        releases: {
          where: {
            mainRelease: null,
          },
        },
      },
    }) as Promise<ArtistWithReleases[]>,
  release: (query: string, take: number) =>
    prisma.release.findMany({
      take,
      where: {
        mainRelease: null,
        normalizedTitle: {
          contains: query,
        },
      },
      orderBy: {
        title: "asc",
      },
      include: {
        artist: true,
        additionalArtists: true,
        subReleases: true,
      },
    }) as Promise<ReleaseWithArtist[]>,
  track: (query: string, take: number) =>
    prisma.track.findMany({
      take,
      where: {
        OR: [
          {
            normalizedTitle: {
              contains: query,
            },
          },
          {
            AND: [
              {
                trackArtist: {
                  contains: query,
                },
              },
              {
                release: {
                  artist: {
                    name: VARIOUS_ARTISTS_NAME,
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        release: {
          include: {
            artist: true,
            additionalArtists: true,
            mainRelease: true,
          },
        },
      },
    }) as Promise<TrackWithRelease[]>,
  collection: (query: string, take: number) =>
    prisma.collection.findMany({
      take,
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        coverRelease: {
          include: {
            artist: true,
            additionalArtists: true,
            subReleases: true,
          },
        },
        releases: {
          where: {
            mainRelease: null,
          },
        },
      },
    }) as Promise<CollectionWithReleases[]>,
  group: (query: string, take: number) =>
    prisma.group.findMany({
      take,
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        coverArtist: {
          include: {
            coverRelease: {
              include: {
                artist: true,
              },
            },
            releases: {
              take: 1,
              where: {
                mainRelease: null,
              },
              include: {
                artist: true,
              },
            },
          },
        },
      },
    }) as Promise<GroupWithArtists[]>,
};

type Transformers = {
  [Entity in keyof Getters]: (
    x: Unpacked<Awaited<ReturnType<Getters[Entity]>>>
  ) => SearchResult;
};

const transformers: Transformers = {
  artist: ({ id, name, coverRelease, releases }: ArtistWithReleases) => ({
    entityType: "SearchResult",
    type: "artist" as const,
    id,
    title: name,
    description: "Artist",
    links: {
      artist: `/artists/${id}`,
    },
    coverRelease: coverRelease || releases[0],
  }),
  release: ({
    id,
    title,
    artist,
    year,
    type,
    hash,
    subReleases,
    additionalArtists,
  }: ReleaseWithArtistAndSubReleases & WithAdditionalArtists) => ({
    entityType: "SearchResult",
    type: "release" as const,
    id,
    title: getReleaseTitle({ title, subReleases }),
    hash,
    artist: getReleaseArtist({ artist, additionalArtists }),
    description: year ? `${type}, ${year}` : type,
    links: {
      release: `/releases/${id}`,
      artist: `/artists/${artist.id}`,
    },
  }),
  collection: ({
    id,
    title,
    coverRelease,
    releases,
  }: CollectionWithReleases) => ({
    entityType: "SearchResult",
    type: "collection" as const,
    id,
    title,
    description: "Collection",
    links: {
      collection: `/collections/${id}`,
    },
    coverRelease: coverRelease || releases[0],
  }),
  group: ({ id, title, coverArtist }: GroupWithArtists) => ({
    entityType: "SearchResult",
    type: "group" as const,
    id,
    title,
    description: "Group",
    links: {
      group: `/groups/${id}`,
    },
    coverRelease: coverArtist ? getCoverRelease(coverArtist) : null,
  }),
  track: ({ id, title, trackArtist, release }: TrackWithRelease) => ({
    entityType: "SearchResult",
    type: "track" as const,
    id,
    title,
    description: "Track",
    artist:
      release.artist.name !== trackArtist
        ? trackArtist
        : normalizeArtistDisplayName(release.artist.name),
    links: {
      track: `/releases/${release.mainReleaseId || release.id}?track_id=${id}`,
      artist: `/artists/${release.artist.id}`,
    },
    coverRelease: release,
  }),
};
