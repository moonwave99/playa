import prisma from "../main/db/prisma";
import sha1 from "sha1";
import { hashArtistName, hashRelease } from "../main/hash";
import type { Release, HasId, EntityType, ReleaseType } from "@/types/types";

export function getFakeArtist(id = 1) {
  const artist = getFakeArtists({ length: 1 }).at(0);
  return {
    ...artist,
    id,
  };
}

export function getFakeArtists({ length = 10 }) {
  return Array.from({ length }, (_, i) => ({
    entityType: "Artist" as EntityType,
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
    entityType: "Release" as EntityType,
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
    entityType: "Release" as EntityType,
    id: (artist_id - 1) * length + i + 1,
    title: `Release ${i + 1}`,
    normalizedTitle: `Release ${i + 1}`,
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
    entityType: "Track" as EntityType,
    id: (releaseId - 1) * length + i + 1,
    title: `Track ${i + 1}`,
    trackArtist: "Track Artist",
    normalizedTitle: `Track ${i + 1}`,
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
    entityType: "Collection" as EntityType,
    id: i + 1,
    title: `Collection ${i + 1}`,
    ...connect,
  }));
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
    entityType: "Group" as EntityType,
    id: i + 1,
    title: `Group ${i + 1}`,
    coverArtistId: artists?.at(0)?.id || null,
    ...connect,
  }));
}

export async function seed() {
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
    where: { id: 3 },
    data: {
      relatedArtists: {
        connect: [{ id: 4 }],
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
  };
}

function getDate(id: number) {
  const month = (id % 12) + 1;
  const day = (id % 28) + 1;
  return new Date(`2025-${pad(month)}-${pad(day)}T21:41:31.693Z`);
}

const pad = (n = 1) => (n < 10 ? `0${n}` : n);
