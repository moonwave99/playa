import { getReleaseTitle, sortByQueryPosition } from "@/lib/utils";
import prisma from "./prisma";
import type { SearchResult, Collection, HasTitle, Artist, ReleaseWithArtistAndSubreleases } from '@/types/types';

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

  return [
    ...collections.map(({ id, title, coverRelease }: Collection) => ({
      id,
      title,
      description: "Collection",
      type: 'collection' as const,
      links: {
        collection: `/collections/${id}`
      },
      coverRelease
    })).toSorted((a: HasTitle, b: HasTitle) => sortByQueryPosition(query, 'title', a, b)),
    ...artists.map(({ id, name, coverRelease }: Artist) => ({
      id,
      title: name,
      description: 'Artist',
      type: 'artist' as const,
      links: {
        artist: `/artists/${id}`
      },
      coverRelease
    })).toSorted((a: HasTitle, b: HasTitle) => sortByQueryPosition(query, 'title', a, b)),
    ...releases.map(({ id, title, artist, year, type, hash, subReleases }: ReleaseWithArtistAndSubreleases) => ({
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
    })).toSorted((a: HasTitle, b: HasTitle) => sortByQueryPosition(query, 'title', a, b)),
  ];
}