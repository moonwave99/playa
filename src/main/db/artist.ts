import prisma from "./prisma";
import {
  countReleasesByType,
  groupItemsByLetter,
  normalizeDiacritics,
  sortReleasesByTypeAndYear,
  withCoverRelease,
} from "@/lib/utils";
import type {
  ArtistWithReleases,
  PaginationParams,
  ArtistUpdate,
  Release,
  ReleaseWithArtistAndSubReleases,
  Track,
  Artist,
} from "@/types/types";

export async function getArtist(id: number) {
  const result = await prisma.artist.findFirst({
    where: { id },
    include: {
      coverRelease: {
        include: {
          artist: true,
        },
      },
      relatedArtists: {
        include: {
          coverRelease: {
            include: {
              additionalArtists: true,
            },
          },
          releases: {
            take: 1,
            where: {
              mainRelease: null,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      },
      groups: {
        select: {
          id: true,
          title: true,
          entityType: true,
        },
        orderBy: { title: "asc" },
      },
      appearsIn: {
        where: {
          mainRelease: null,
        },
        include: {
          artist: true,
          additionalArtists: true,
          subReleases: {
            include: {
              tracks: {
                orderBy: { position: "asc" },
              },
            },
            orderBy: {
              discNumber: "asc",
            },
          },
          tracks: {
            orderBy: { position: "asc" },
          },
        },
      },
      releases: {
        where: {
          mainRelease: null,
        },
        include: {
          artist: true,
          additionalArtists: true,
          subReleases: {
            include: {
              tracks: {
                orderBy: { position: "asc" },
              },
            },
            orderBy: {
              discNumber: "asc",
            },
          },
          tracks: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  if (!result) {
    return null;
  }

  const { releases, appearsIn } = result;
  return {
    ...result,
    entityType: "Artist" as const,
    coverRelease: result.coverRelease as ReleaseWithArtistAndSubReleases,
    releases: sortReleasesByTypeAndYear([
      ...(releases as Release[]),
      ...(appearsIn as Release[]),
    ]) as (ReleaseWithArtistAndSubReleases & { tracks: Track[] })[],
    relatedArtists: result.relatedArtists.map((x) =>
      withCoverRelease(x as ArtistWithReleases)
    ),
  };
}

export async function getLatestArtists({
  take = 50,
  skip = 0,
}: PaginationParams = {}) {
  const [results, total] = await prisma.$transaction([
    prisma.artist.findMany({
      take,
      skip,
      orderBy: { id: "desc" },
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
          include: {
            artist: true,
          },
        },
      },
    }),
    prisma.artist.count(),
  ]);

  return {
    pagination: {
      take,
      skip,
      total,
    },
    results: results.map((x) => withReleaseCount(x as ArtistWithReleases)),
  };
}

export async function getAllArtists() {
  const artists = await prisma.artist.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      entityType: true,
      name: true,
      normalizedName: true,
      hash: true,
      path: true,
    },
  });
  return groupItemsByLetter(artists as Artist[]);
}

function withReleaseCount(artist: ArtistWithReleases) {
  return { ...artist, releaseCount: countReleasesByType(artist.releases) };
}

export async function updateArtist(id: number, { name, path }: ArtistUpdate) {
  return prisma.artist.update({
    where: { id },
    data: { name, normalizedName: normalizeDiacritics(name), path },
  });
}

export async function setArtistCoverRelease(
  artist_id: number,
  release_id: number
) {
  return await prisma.artist.update({
    where: { id: artist_id },
    data: { coverReleaseId: release_id },
  });
}

export type SearchArtistsParams = {
  query: string;
  exclude?: {
    key: "relatedArtists" | "appearsIn";
    artist_id: number;
    release_id?: number;
  };
  take?: number;
};

function getExcludeFilter(exclude: SearchArtistsParams["exclude"]) {
  if (exclude.key === "relatedArtists") {
    return {
      relatedArtists: {
        none: {
          id: exclude.artist_id,
        },
      },
      id: { not: exclude.artist_id },
    };
  }
  return {
    appearsIn: {
      none: {
        id: exclude.release_id,
      },
    },
    id: { not: exclude.artist_id },
  };
}

export async function searchArtists({
  query,
  exclude,
  take = 50,
}: SearchArtistsParams) {
  const result = await prisma.artist.findMany({
    take,
    where: {
      name: {
        contains: query,
      },
      ...getExcludeFilter(exclude),
    },
    include: {
      coverRelease: {
        include: {
          subReleases: true,
          additionalArtists: true,
          artist: true,
        },
      },
      releases: {
        take: 1,
        where: {
          mainRelease: null,
        },
        include: {
          subReleases: true,
          additionalArtists: true,
          artist: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
  return result.map((x) => withCoverRelease(x as ArtistWithReleases));
}

export async function addRelatedArtist(first_id: number, second_id: number) {
  await prisma.artist.update({
    where: { id: first_id },
    data: { relatedArtists: { connect: [{ id: second_id }] } },
  });
  await prisma.artist.update({
    where: { id: second_id },
    data: { relatedArtists: { connect: [{ id: first_id }] } },
  });
  return true;
}

export async function removeRelatedArtist(first_id: number, second_id: number) {
  await prisma.artist.update({
    where: { id: first_id },
    data: { relatedArtists: { disconnect: [{ id: second_id }] } },
  });
  await prisma.artist.update({
    where: { id: second_id },
    data: { relatedArtists: { disconnect: [{ id: first_id }] } },
  });
  return true;
}
