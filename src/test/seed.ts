import path from "node:path";
import { copy, remove } from "fs-extra";
import { PrismaClient } from "@prisma/client-generated";
import sha1 from "sha1";
import { hashArtistName, hashRelease } from "../main/hash";
import type { Release, HasId, EntityType, ReleaseType } from "@/types/types";
import { pad } from "@/lib/utils";
import { getE2ETmpPath, BUILD_PATH } from "./utils";
import { DEFAULT_SETTINGS } from "@/constants";

export function getFakeArtist(id = 1) {
  const artist = getFakeArtists({ length: 1 }).at(0);
  return {
    ...artist,
    id,
  };
}

export function getFakeArtists({ length = 10 }) {
  return Array.from({ length }, (_, i) => ({
    entityType: "artist" as EntityType,
    id: i + 1,
    name: `Artist ${i + 1}`,
    normalizedName: `Artist ${i + 1}`,
    path: `A/Artist ${i + 1}`,
    hash: hashArtistName(`Artist ${i + 1}`),
    createdAt: getDate(i),
  }));
}

export function getFakeRelease(id = 1, override: Partial<Release> = {}) {
  return {
    entityType: "release" as EntityType,
    id,
    title: `Release ${id}`,
    normalizedTitle: `Release ${id}`,
    type: "Album" as ReleaseType,
    year: 2000,
    path: `Release ${id}`,
    completePath: `[Album]/2000 - Release ${id}`,
    hash: hashRelease({
      title: `Release ${id}`,
      type: "Album",
      year: 2000,
      artist_id: override.artist_id,
    }),
    artist_id: override.artist_id,
    discTitle: "",
    discNumber: 1,
    createdAt: getDate(id),
    updatedAt: getDate(id),
    mainReleaseId: null as number,
    hideOnHomepage: false,
    ...override,
  };
}

export function getFakeReleasesForArtist(artist_id: number, length = 5) {
  return Array.from({ length }, (_, i) => ({
    entityType: "release" as EntityType,
    id: (artist_id - 1) * length + i + 1,
    title: `Release ${artist_id}-${i + 1}`,
    normalizedTitle: `Release ${artist_id}-${i + 1}`,
    type: "Album" as ReleaseType,
    year: 2000,
    path: `Release ${i + 1}`,
    completePath: `A/Artist ${artist_id}/[Album]/2000 - Release ${i + 1}`,
    hash: hashRelease({
      title: `Release ${i + 1}`,
      type: "Album",
      year: 2000,
      artist_id,
    }),
    artist_id,
    discTitle: "",
    discNumber: 1,
    createdAt: getDate(i),
    updatedAt: getDate(i),
    mainReleaseId: null as number,
    hideOnHomepage: false,
  }));
}

export function getFakeTracksForRelease(releaseId: number, length = 5) {
  return Array.from({ length }, (_, i) => ({
    entityType: "track" as EntityType,
    id: (releaseId - 1) * length + i + 1,
    title: `Track ${i + 1}`,
    normalizedTitle: `Track ${i + 1}`,
    trackArtist: "Track Artist",
    normalizedTrackArtist: "Track Artist",
    path: `0${i + 1} - Track ${i + 1}.mp3`,
    hash: sha1(
      `${releaseId * length + i + 1}-0${i + 1} - Track ${i + 1}.mp3`
    ).slice(0, 16),
    duration: 180,
    releaseId,
    position: i + 1,
  }));
}

export function getFakeCollection(id = 1) {
  const collection = getFakeCollections({ length: 1 }).at(0);
  return {
    ...collection,
    id,
  };
}

export function getFakeCollections({
  length = 3,
  releases = [],
}: {
  length: number;
  releases?: HasId[];
}) {
  const connect = releases?.length ? { releases: { connect: releases } } : {};
  return Array.from({ length }, (_, i) => ({
    entityType: "collection" as EntityType,
    id: i + 1,
    title: `Collection ${i + 1}`,
    ...connect,
  }));
}

export function getFakeGroup(id = 1) {
  const group = getFakeGroups({ length: 1 }).at(0);
  return {
    ...group,
    id,
  };
}

export function getFakeGroups({
  length = 3,
  artists = [],
}: {
  length: number;
  artists?: HasId[];
}) {
  const connect = artists?.length ? { artists: { connect: artists } } : {};
  return Array.from({ length }, (_, i) => ({
    entityType: "group" as EntityType,
    id: i + 1,
    title: `Group ${i + 1}`,
    coverArtistId: artists?.at(0)?.id || null,
    ...connect,
  }));
}

export function getFakeSettings() {
  return {
    PLAYER_PATH: "PLAYER_PATH",
    TAGGER_PATH: "PLAYER_PATH",
    DISCOGS_KEY: "DISCOGS_KEY",
    DISCOGS_SECRET: "DISCOGS_SECRET",
    LIBRARY_PATH: "LIBRARY_PATH",
    COVERS_PATH: "COVERS_PATH",
    USE_SMART_IMPORT: false,
    SHOW_ONBOARDING_ON_STARTUP: false,
  };
}

function getUrl(id?: string) {
  const { NODE_ENV, npm_lifecycle_event } = process.env;
  if (NODE_ENV === "test") {
    return "";
  }
  if (NODE_ENV === "development") {
    return "file:data.db";
  }
  if (npm_lifecycle_event === "test:e2e") {
    const dbName = id ? `data-${id}.db` : "data.db";
    return `file:${path.join(BUILD_PATH, dbName)}`;
  }
  return `file:${path.join(process.resourcesPath, "data.db")}`;
}

async function cloneDb(id: string) {
  const original = path.join(
    BUILD_PATH,
    id === "test" ? "data.db" : "data-test.db"
  );
  const target = path.join(BUILD_PATH, `data-${id}.db`);
  await copy(original, target);
}

export async function removeDb(id: string) {
  const target = path.join(BUILD_PATH, `data-${id}.db`);
  await remove(path.normalize(target));
}

type CleanupParams = {
  id: string;
  prisma?: PrismaClient;
  preserveSettings?: boolean;
  enableOnboarding?: boolean;
};

export async function cleanup({
  id,
  prisma,
  preserveSettings = false,
  enableOnboarding = false,
}: CleanupParams) {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: getUrl(id),
        },
      },
    });
  }
  await prisma.track.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.release.deleteMany({});
  await prisma.artist.deleteMany({});
  if (!preserveSettings) {
    await prisma.settings.deleteMany({});
    return;
  }
  if (enableOnboarding) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = DEFAULT_SETTINGS;
    await prisma.settings.updateMany({
      data,
    });
  }
}

export async function seed(id?: string) {
  if (id) {
    await cloneDb(id);
  }
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: getUrl(id),
      },
    },
  });
  await cleanup({ id, prisma });

  await prisma.settings.create({
    data: {
      ...getFakeSettings(),
      ...(id && id !== "test"
        ? {
            USE_SMART_IMPORT: true,
            LIBRARY_PATH: path.join(getE2ETmpPath(id), "LIBRARY_PATH"),
            COVERS_PATH: path.join(getE2ETmpPath(id), "COVERS_PATH"),
          }
        : {}),
    },
  });

  const artists = getFakeArtists({ length: 10 });
  const releases = artists.flatMap((x) => getFakeReleasesForArtist(x.id));

  await prisma.artist.createMany({ data: artists });
  await prisma.release.createMany({ data: releases });
  await prisma.track.createMany({
    data: releases.flatMap((r) => getFakeTracksForRelease(r.id)),
  });
  await Promise.all(
    getFakeGroups({ length: 3 }).map((x) =>
      prisma.group.create({
        data: {
          ...x,
          artists: { connect: artists.slice(0, 3).map(({ id }) => ({ id })) },
        },
      })
    )
  );

  await Promise.all(
    getFakeCollections({ length: 3 }).map((x, i) =>
      prisma.collection.create({
        data: {
          ...x,
          releases: {
            connect: Array.from({ length: 3 }, (_, j) => ({
              id: j + 1 + 3 * i,
            })),
          },
        },
      })
    )
  );

  await prisma.artist.update({
    where: { id: 1 },
    data: {
      relatedArtists: {
        connect: [{ id: 2 }],
      },
    },
  });

  await prisma.artist.update({
    where: { id: 2 },
    data: {
      relatedArtists: {
        connect: [{ id: 1 }],
      },
    },
  });

  await prisma.artist.update({
    where: { id: 3 },
    data: {
      relatedArtists: {
        connect: [{ id: 4 }],
      },
    },
  });

  await prisma.artist.update({
    where: { id: 4 },
    data: {
      relatedArtists: {
        connect: [{ id: 3 }],
      },
    },
  });

  await prisma.release.update({
    where: { id: 1 },
    data: {
      additionalArtists: {
        connect: [{ id: 2 }],
      },
    },
  });
  await prisma.release.update({
    where: { id: 2 },
    data: {
      additionalArtists: {
        connect: [{ id: 2 }],
      },
    },
  });
  await prisma.release.update({
    where: { id: 1 },
    data: {
      additionalArtists: {
        connect: [{ id: 3 }],
      },
    },
  });
  await prisma.release.update({
    where: { id: 3 },
    data: {
      additionalArtists: {
        connect: [{ id: 4 }],
      },
    },
  });
}

export async function getData() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: getUrl(),
      },
    },
  });
  return {
    artists: await prisma.artist.findMany({
      include: {
        groups: { select: { id: true } },
        appearsIn: { select: { id: true } },
        relatedArtists: { select: { id: true } },
        coverGroups: { select: { id: true } },
      },
    }),
    releases: await prisma.release.findMany({
      include: {
        subReleases: { select: { id: true } },
        coverCollections: { select: { id: true } },
      },
    }),
    tracks: await prisma.track.findMany(),
    groups: await prisma.group.findMany(),
    collections: await prisma.collection.findMany(),
    settings: await prisma.settings.findMany(),
  };
}

function getDate(id: number) {
  const month = (id % 12) + 1;
  const day = (id % 28) + 1;
  return new Date(`2025-${pad(month)}-${pad(day)}T21:41:31.693Z`);
}
