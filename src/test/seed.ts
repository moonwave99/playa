import sha1 from "sha1";
import { hashArtistName, hashRelease } from "../main/hash";
import type { HasId } from "@/types/types";

export function getFakeArtist(id = 1) {
  const artist = getFakeArtists({ length: 1 }).at(0);
  return {
    ...artist,
    id,
  };
}

export function getFakeArtists({ length = 10 }) {
  return Array.from({ length }, (_, i) => ({
    id: i + 1,
    name: `Artist ${i + 1}`,
    normalizedName: `Artist ${i + 1}`,
    path: `A/Artist ${i + 1}`,
    hash: hashArtistName(`Artist ${i + 1}`),
  }));
}

export function getFakeReleasesForArtist(artist_id: number, length = 5) {
  return Array.from({ length }, (_, i) => ({
    id: (artist_id - 1) * length + i + 1,
    title: `Release ${i + 1}`,
    normalizedTitle: `Release ${i + 1}`,
    type: "Album" as const,
    year: 2000,
    path: `Release ${i + 1}`,
    hash: hashRelease({
      title: `Release ${i + 1}`,
      type: "Album",
      year: 2000,
      artist_id,
    }),
    artist_id,
    discTitle: "",
    discNumber: 1,
    createdAt: new Date(`2025-0${i + 1}-0${i + 1}T21:41:31.693Z`),
    updatedAt: new Date(`2025-0${i + 1}-0${i + 1}T21:41:31.693Z`),
    mainReleaseId: null as number,
    hideOnHomepage: false,
  }));
}

export function getFakeTracksForRelease(releaseId: number, length = 5) {
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

export function getFakeCollections({
  length = 3,
  releases = [],
}: {
  length: number;
  releases?: HasId[];
}) {
  return Array.from({ length }, (_, i) => ({
    id: i + 1,
    title: `Collection ${i + 1}`,
    releases: {
      connect: releases,
    },
  }));
}

export function getFakeGroups({
  length = 3,
  artists = [],
}: {
  length: number;
  artists?: HasId[];
}) {
  return Array.from({ length }, (_, i) => ({
    id: i + 1,
    title: `Group ${i + 1}`,
    coverArtistId: artists?.at(0)?.id || null,
    artists: {
      connect: artists,
    },
  }));
}
