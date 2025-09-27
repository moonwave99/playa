import prisma from "./prisma";
import sha1 from "sha1";

import type {
  HasId,
  TrackInfo,
  PaginationParams,
  Release,
  WithSubReleases,
} from "@/types/types";
import { normalizeDiacritics } from "@/lib/utils";

export async function getRelease(id: number) {
  return prisma.release.findFirst({
    where: { id },
    include: {
      artist: true,
      additionalArtists: true,
      subReleases: {
        include: {
          artist: true,
          tracks: {
            orderBy: {
              position: "asc",
            },
          },
        },
        orderBy: {
          discNumber: "asc",
        },
      },
      mainRelease: true,
      tracks: { orderBy: { position: "asc" } },
      collections: {
        select: {
          id: true,
          title: true,
          entityType: true,
        },
        orderBy: { title: "asc" },
      },
    },
  });
}

export async function deleteRelease(id: number) {
  const release = await prisma.release.findFirst({
    where: { id },
    include: {
      subReleases: true,
    },
  });
  if (!release) {
    return;
  }
  await prisma.release.deleteMany({
    where: {
      id: {
        in: [id, ...release.subReleases.map(({ id }: HasId) => id)],
      },
    },
  });
  return release;
}

export async function addTracksToRelease(id: number, trackInfo: TrackInfo[]) {
  await prisma.track.deleteMany({
    where: {
      releaseId: id,
    },
  });

  const tracks = await Promise.all(
    trackInfo.map((track) =>
      prisma.track.create({
        data: {
          ...track,
          normalizedTitle: normalizeDiacritics(track.title),
          hash: sha1(`${id}-${track.path}`).slice(0, 16),
          releaseId: id,
        },
      })
    )
  );

  return prisma.release.update({
    where: {
      id,
    },
    data: {
      tracks: {
        connect: tracks.map((x) => ({ id: x.id })),
      },
    },
    include: {
      artist: true,
      tracks: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });
}

export type GroupReleaseParams = {
  mainRelease: {
    id: number;
    title: string;
  };
  discInfo: { id: number; title: string; number: number }[];
};

export async function groupReleases({
  mainRelease,
  discInfo,
}: GroupReleaseParams) {
  const result = await prisma.$transaction([
    ...discInfo.slice(1).map(({ id, title, number }) =>
      prisma.release.update({
        where: { id },
        data: {
          title: mainRelease.title,
          normalizedTitle: normalizeDiacritics(mainRelease.title),
          mainReleaseId: mainRelease.id,
          discTitle: title,
          discNumber: number,
        },
        select: {
          id: true,
          artist_id: true,
          additionalArtists: { select: { id: true } },
        },
      })
    ),
    prisma.release.update({
      where: {
        id: mainRelease.id,
      },
      data: {
        title: mainRelease.title,
        normalizedTitle: normalizeDiacritics(mainRelease.title),
        discTitle: discInfo[0].title,
        discNumber: 1,
        subReleases: {
          connect: discInfo.slice(1).map(({ id }) => ({ id })),
        },
      },
      select: {
        id: true,
        artist_id: true,
        additionalArtists: { select: { id: true } },
      },
    }),
  ]);

  return {
    updatedArtists: [
      ...new Set(
        result.flatMap((x) => [
          x.artist_id,
          ...x.additionalArtists.map(({ id }) => id),
        ])
      ),
    ],
  };
}

export async function unGroupRelease(release: Release & WithSubReleases) {
  await prisma.$transaction([
    prisma.release.update({
      where: {
        id: release.id,
      },
      data: {
        title: release.path,
        discNumber: null,
        discTitle: null,
        subReleases: {
          set: [],
        },
      },
    }),
    ...release.subReleases.map(({ id, path }) => {
      return prisma.release.update({
        where: {
          id,
        },
        data: {
          mainReleaseId: null,
          title: path,
          discNumber: null,
          discTitle: null,
        },
      });
    }),
  ]);
}

export async function getReleases({
  take = 50,
  skip = 0,
}: PaginationParams = {}) {
  const [results, total] = await prisma.$transaction([
    prisma.release.findMany({
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        artist: true,
        subReleases: true,
        mainRelease: true,
        additionalArtists: true,
      },
      where: {
        mainRelease: null,
        hideOnHomepage: false,
      },
    }),
    prisma.release.count(),
  ]);
  return {
    pagination: {
      take,
      skip,
      total,
    },
    results,
  };
}

export async function getLatestAdditions(
  from: string
): Promise<Record<string, Pick<Release, "id" | "createdAt">[]>> {
  const releases = await prisma.release.findMany({
    where: {
      mainRelease: null,
      createdAt: {
        gte: new Date(from),
      },
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  return Object.groupBy(
    releases,
    (x: Release) => x.createdAt.toISOString().split("T")[0]
  );
}

type RenameReleaseParam = Pick<
  Release,
  | "id"
  | "title"
  | "path"
  | "hash"
  | "discTitle"
  | "discNumber"
  | "type"
  | "year"
>[];

export async function updateReleases(infos: RenameReleaseParam) {
  return prisma.$transaction(
    infos.map(({ id, title, path, hash, discTitle, discNumber, type, year }) =>
      prisma.release.update({
        where: { id },
        data: {
          title,
          normalizedTitle: normalizeDiacritics(title),
          path,
          hash,
          discTitle,
          discNumber,
          type,
          year,
        },
      })
    )
  );
}

export async function toggleHomepageVisibility(
  id: number,
  hideOnHomepage = true
) {
  return prisma.release.update({
    where: { id },
    data: {
      hideOnHomepage,
    },
  });
}

export type AdditionalArtistParams = {
  release_id: number;
  artist_id: number;
};

export async function addAdditionalArtist({
  release_id,
  artist_id,
}: AdditionalArtistParams) {
  return prisma.release.update({
    where: { id: release_id },
    data: {
      additionalArtists: {
        connect: { id: artist_id },
      },
    },
    include: {
      artist: true,
      additionalArtists: true,
    },
  });
}

export async function removeAdditionalArtist({
  release_id,
  artist_id,
}: AdditionalArtistParams) {
  return prisma.release.update({
    where: { id: release_id },
    data: {
      additionalArtists: {
        disconnect: { id: artist_id },
      },
    },
    include: {
      artist: true,
      additionalArtists: true,
    },
  });
}
