import { getReleaseTitle, sortByQueryPosition } from "@/lib/utils";
import prisma from "./prisma";
import type { SearchResult, HasTitle, ReleaseWithArtistAndSubreleases, CollectionWithReleases, ArtistWithReleases, TrackWithRelease } from '@/types/types';

export async function search(query: string, take = 20): Promise<SearchResult[]> {
  const releases = await prisma.release.findMany({
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
      ],
    },
    orderBy: {
      title: 'asc',
    },
    select: {
      id: true,
      artist: true,
      title: true,
      type: true,
      year: true,
      hash: true,
      subReleases: true,
    },
  });

  const artists = await prisma.artist.findMany({
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
  });

  const collections = await prisma.collection.findMany({
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
  });

  const tracks = await prisma.track.findMany({
    take: 10,
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
  });

  return [
    tracks.map(transformers.track),
    collections.map(transformers.collection),
    artists.map(transformers.artist),
    releases.map(transformers.release),
  ].flatMap(
    x => x.toSorted((a: HasTitle, b: HasTitle) => sortByQueryPosition(query, 'title', a, b))
  );
}

const transformers = {
  artist: (
    { id, name, coverRelease, releases }: ArtistWithReleases
  ) => ({
    id,
    title: name,
    description: 'Artist',
    type: 'artist' as const,
    links: {
      artist: `/artists/${id}`
    },
    coverRelease: coverRelease || releases[0]
  }),
  release: (
    { id, title, artist, year, type, hash, subReleases }: ReleaseWithArtistAndSubreleases
  ) => ({
    id,
    title: getReleaseTitle({ title, subReleases }),
    hash,
    artist: artist.name,
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
    id,
    title,
    description: "Collection",
    type: 'collection' as const,
    links: {
      collection: `/collections/${id}`
    },
    coverRelease: coverRelease || releases[0]
  }),
  track: (
    { id, title, release }: TrackWithRelease
  ) => ({
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