import prisma from "./prisma";
import sha1 from "sha1";
import { hashArtistName, hashRelease } from "../hash";

const artists = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Artist ${i + 1}`,
  normalizedName: `Artist ${i + 1}`,
  path: `A/Artist ${i + 1}`,
  hash: hashArtistName(`Artist ${i + 1}`),
}));

function getReleasesForArtist(artist_id: number, length = 5) {
  return Array.from({ length }, (_, i) => ({
    id: (artist_id - 1) * length + i + 1,
    title: `Release ${i + 1}`,
    normalizedTitle: `Release ${i + 1}`,
    type: "Album" as const,
    year: 2000,
    path: `[Album]/2000 - Release ${i + 1}`,
    hash: hashRelease({
      title: `Release ${i + 1}`,
      type: "Album",
      year: 2000,
      artist_id,
    }),
    artist_id,
    createdAt: `2025-0${i + 1}-0${i + 1}T21:41:31.693Z`,
  }));
}

function getTracksForRelease(releaseId: number, length = 5) {
  return Array.from({ length }, (_, i) => ({
    id: (releaseId - 1) * length + i + 1,
    title: `Track ${i + 1}`,
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

const collections = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1,
  title: `Collection ${i + 1}`,
  releases: {
    connect: Array.from({ length: 3 }, (_, j) => ({ id: j + 1 + 3 * i })),
  },
}));

const groups = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1,
  title: `Group ${i + 1}`,
  artists: {
    connect: [{ id: i + 1 }],
  },
}));

async function main() {
  const releases = artists.flatMap((x) => getReleasesForArtist(x.id));
  await prisma.artist.createMany({ data: artists });
  await prisma.release.createMany({ data: releases });
  await prisma.track.createMany({
    data: releases.flatMap((r) => getTracksForRelease(r.id)),
  });
  await Promise.all(groups.map((data) => prisma.group.create({ data })));
  await Promise.all(
    collections.map((data) => prisma.collection.create({ data }))
  );

  await prisma.artist.update({
    where: { id: 1 },
    data: {
      relatedArtists: {
        connect: [{ id: 2 }],
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
}

main();
