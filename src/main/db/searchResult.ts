
import prisma from "./prisma";
import type {
  SearchableEntities,
  SearchResult,
  HasTitle,
  ReleaseWithArtistAndSubreleases,
  CollectionWithReleases,
  ArtistWithReleases,
  TrackWithRelease,
  GroupWithArtists,
  WithAdditionalArtists,
  ReleaseWithArtist,
  Unpacked
} from '@/types/types';
import { withEntityType } from "@/types/types";
import {
  getCoverRelease,
  getReleaseTitle,
  getReleaseArtist,
  sortByQueryPosition
} from "@/lib/utils";

type GetSearchResultParams = {
  query: string;
  take?: number;
  type?: SearchableEntities;
};

export async function getSearchResults({ query, take = 20, type }: GetSearchResultParams): Promise<SearchResult[]> {
  const types = (type ? [type] : Object.keys(getters)) as SearchableEntities[];
  const data = await Promise.all(
    types.map(
      async (type) => {
        const results = await getters[type](query, take);
        const transformer
          = transformers[type] as (x: Unpacked<typeof results>) => SearchResult;
        return results.map(transformer);
      }
    )
  );

  return withEntityType(data.flatMap(
    x => x.toSorted((a: HasTitle, b: HasTitle) => sortByQueryPosition(query, 'title', a, b))
  ), 'searchResult');
}

type Getter<T> = (query: string, take: number) => Promise<T[]>;

type Getters = {
  release: Getter<ReleaseWithArtist>;
  artist: Getter<ArtistWithReleases>;
  track: Getter<TrackWithRelease>;
  collection: Getter<CollectionWithReleases>;
  group: Getter<GroupWithArtists>;
};

const getters: Getters = {
  artist: (query: string, take: number) => prisma.artist.findMany({
    take,
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    include: {
      coverRelease: {
        include: {
          artist: true
        }
      },
      releases: {
        where: {
          mainRelease: null
        }
      }
    },
  }),
  release: (query: string, take: number) => prisma.release.findMany({
    take,
    where: {
      mainRelease: null,
      OR: [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          artist: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        {
          additionalArtists: {
            some: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            }
          }
        }
      ],
    },
    orderBy: {
      title: 'asc',
    },
    include: {
      artist: true,
      additionalArtists: true,
      subReleases: true,
    },
  }),
  track: (query: string, take: number) => prisma.track.findMany({
    take,
    where: {
      title: {
        contains: query,
        mode: "insensitive",
      },
    },
    include: {
      release: {
        include: {
          artist: true
        }
      }
    },
  }),
  collection: (query: string, take: number) => prisma.collection.findMany({
    take,
    where: {
      title: {
        contains: query,
        mode: "insensitive",
      },
    },
    include: {
      coverRelease: {
        include: {
          artist: true
        }
      },
      releases: {
        where: {
          mainRelease: null
        }
      }
    },
  }),
  group: (query: string, take: number) => prisma.group.findMany({
    take,
    where: {
      title: {
        contains: query,
        mode: "insensitive",
      },
    },
    include: {
      coverArtist: {
        include: {
          coverRelease: {
            include: {
              artist: true
            }
          },
          releases: {
            take: 1,
            where: {
              mainRelease: null
            },
            include: {
              artist: true
            }
          }
        }
      },
    },
  }),
};

type Transformers = {
  [Entity in keyof Getters]: (
    x: Unpacked<Awaited<ReturnType<Getters[Entity]>>>
  ) => SearchResult;
};

const transformers: Transformers = {
  artist: (
    { id, name, coverRelease, releases }: ArtistWithReleases
  ) => ({
    _type: 'searchResult',
    id,
    title: name,
    description: 'Artist',
    type: 'artist' as const,
    links: {
      artist: `/artists/${id}`
    },
    coverRelease: coverRelease || releases[0],
  }),
  release: (
    { id, title, artist, year, type, hash, subReleases, additionalArtists }: ReleaseWithArtistAndSubreleases & WithAdditionalArtists
  ) => ({
    _type: 'searchResult',
    id,
    title: getReleaseTitle({ title, subReleases }),
    hash,
    artist: getReleaseArtist({ artist, additionalArtists }),
    description: year ? `${type}, ${year}` : type,
    type: 'release' as const,
    links: {
      release: `/releases/${id}`,
      artist: `/artists/${artist.id}`
    }
  }),
  collection: (
    { id, title, coverRelease, releases }: CollectionWithReleases
  ) => ({
    _type: 'searchResult',
    id,
    title,
    description: "Collection",
    type: 'collection' as const,
    links: {
      collection: `/collections/${id}`
    },
    coverRelease: coverRelease || releases[0]
  }),
  group: (
    { id, title, coverArtist }: GroupWithArtists
  ) => ({
    _type: 'searchResult',
    id,
    title,
    description: "Group",
    type: 'group' as const,
    links: {
      group: `/groups/${id}`
    },
    coverRelease: coverArtist ? getCoverRelease(coverArtist) : null
  }),
  track: (
    { id, title, release }: TrackWithRelease
  ) => ({
    _type: 'searchResult',
    id,
    title,
    description: "Track",
    type: 'track' as const,
    artist: release.artist.name,
    links: {
      track: `/releases/${release.id}?track_id=${id}`,
      artist: `/artists/${release.artist.id}`,
    },
    coverRelease: release
  }),
};