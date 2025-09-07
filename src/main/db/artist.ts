import prisma from "./prisma";
import {
  countReleasesByType,
  normalizeDiacritics,
  sortReleasesByTypeAndYear,
  withCoverRelease,
} from "@/lib/utils";
import { withEntityType } from "@/types/types";
import type {
  Artist,
  ArtistWithReleases,
  ArtistWithReleasesFull,
  PaginationParams,
  ArtistUpdate,
  ReleaseWithArtist,
} from "@/types/types";

export async function getArtist(id: number): Promise<ArtistWithReleasesFull> {
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
          coverRelease: true,
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
  return withEntityType(
    {
      ...result,
      releases: withEntityType(
        sortReleasesByTypeAndYear([...releases, ...appearsIn]),
        "release"
      ).map((x: ReleaseWithArtist) => ({
        ...x,
        artist: withEntityType(x.artist, "artist"),
        additionalArtists: withEntityType(x.additionalArtists, "artist"),
      })),
      relatedArtists: withEntityType(
        result.relatedArtists.map((x) =>
          withCoverRelease(x as ArtistWithReleases)
        ),
        "artist"
      ),
      groups: withEntityType(result.groups, "group"),
    },
    "artist"
  );
}

export type GetArtistsParams = PaginationParams & {
  startsWith?: string;
};

export async function getArtists({
  take = 50,
  skip = 0,
  startsWith,
}: GetArtistsParams) {
  const where =
    startsWith === "symbol"
      ? {
          path: {
            startsWith: "0-9_",
          },
        }
      : {
          name: {
            startsWith,
          },
        };

  const [results, total] = await prisma.$transaction([
    prisma.artist.findMany({
      take,
      skip,
      where,
      orderBy: { name: "asc" },
      include: { releases: true },
    }),
    prisma.artist.count({ where }),
  ]);
  return {
    pagination: {
      take,
      skip,
      total,
    },
    results: results.map(withReleaseCount),
  };
}

export async function getLatestArtists({
  take = 50,
  skip = 0,
}: PaginationParams) {
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
    results: results
      .map(withReleaseCount)
      .map((x: ArtistWithReleases) => withEntityType(x, "artist"))
      .map((x: ArtistWithReleases) => ({
        ...x,
        releases: withEntityType(
          x.releases.map((y) => ({ ...y, artist: { name: x.name } })),
          "release"
        ),
      })),
  };
}

export async function getAllArtists(): Promise<Artist[]> {
  const result = await prisma.artist.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      normalizedName: true,
      hash: true,
      path: true,
    },
  });
  return result ? withEntityType(result, "artist") : null;
}

function withReleaseCount(artist: ArtistWithReleases) {
  return { ...artist, releaseCount: countReleasesByType(artist.releases) };
}

export async function updateArtist(id: number, { name, path }: ArtistUpdate) {
  const result = await prisma.artist.update({
    where: { id },
    data: { name, normalizedName: normalizeDiacritics(name), path },
    include: {
      relatedArtists: true,
    },
  });
  return result ? withEntityType(result, "artist") : null;
}

export async function setArtistCoverRelease(
  artist_id: number,
  release_id: number
) {
  const result = await prisma.artist.update({
    where: { id: artist_id },
    data: { coverReleaseId: release_id },
  });
  return result ? withEntityType(result, "artist") : null;
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
}: SearchArtistsParams): Promise<Artist[]> {
  const result = await prisma.artist.findMany({
    take,
    where: {
      name: {
        contains: query,
      },
      ...getExcludeFilter(exclude),
    },
    include: {
      coverRelease: true,
      releases: {
        take: 1,
        where: {
          mainRelease: null,
        },
      },
    },
    orderBy: { name: "asc" },
  });
  return result.map(withCoverRelease);
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
