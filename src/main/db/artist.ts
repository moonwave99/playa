import prisma from "./prisma";
import { countReleasesByType, sortReleasesByTypeAndYear } from '@/lib/utils';
import { withEntityType } from "@/types/types";
import type {
  Artist,
  ArtistWithReleases,
  ArtistWithReleasesFull,
  PaginationParams,
  ArtistUpdate
} from '@/types/types';

export async function getArtist(id: number): Promise<ArtistWithReleasesFull> {
  const result = await prisma.artist.findFirst({
    where: { id },
    include: {
      releases: {
        where: {
          mainRelease: null
        },
        include: {
          subReleases: {
            include: {
              tracks: {
                orderBy: { position: "asc" },
              }
            }
          },
          artist: true,
          tracks: {
            orderBy: { position: "asc" },
          }
        }
      }
    },
  });

  if (!result) {
    return null;
  }
  const { releases, ...artist } = result as ArtistWithReleasesFull;
  return withEntityType({
    ...result,
    releases: withEntityType(sortReleasesByTypeAndYear(releases, artist), 'release')
  }, 'artist');
}

export type GetArtistsParams = PaginationParams & {
  startsWith?: string;
};

export async function getArtists(
  { take = 50, skip = 0, startsWith }: GetArtistsParams
) {
  const where = startsWith === 'symbol' ? {
    path: {
      startsWith: '0-9_'
    }
  } : {
    name: {
      startsWith,
      mode: 'insensitive'
    }
  };

  const [results, total] = await prisma.$transaction([
    prisma.artist.findMany({
      take,
      skip,
      where,
      orderBy: { name: "asc" },
      include: { releases: true },
    }),
    prisma.artist.count({ where })
  ]);
  return {
    pagination: {
      take,
      skip,
      total
    },
    results: results.map(withReleaseCount)
  };
}

export async function getLatestArtists(
  { take = 50, skip = 0 }: PaginationParams
) {
  const [results, total] = await prisma.$transaction([
    prisma.artist.findMany({
      take,
      skip,
      orderBy: { id: "desc" },
      include: {
        releases: {
          where: {
            mainRelease: null
          }
        }
      },
    }),
    prisma.artist.count()
  ]);

  return {
    pagination: {
      take,
      skip,
      total
    },
    results: results
      .map(withReleaseCount)
      .map(((x: ArtistWithReleases) => withEntityType(x, 'artist')))
      .map((x: ArtistWithReleases) => ({
        ...x,
        releases: withEntityType(x.releases.map(y => ({ ...y, artist: { name: x.name } })), 'release')
      }))
  };
}

export async function getAllArtists(): Promise<Artist[]> {
  const result = await prisma.artist.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, hash: true, path: true },
  });
  return withEntityType(result, 'artist');
}

function withReleaseCount(artist: ArtistWithReleases) {
  return { ...artist, releaseCount: countReleasesByType(artist.releases) };
}

export async function updateArtist(id: number, { name, path }: ArtistUpdate) {
  const result = await prisma.artist.update({
    where: { id },
    data: { name, path }
  });
  return withEntityType(result, 'artist');
}