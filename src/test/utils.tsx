import { MemoryRouter } from "react-router";
import type { ReactNode } from "react";
import type { ReleaseWithArtist, Artist, Track } from "@/types/types";
import path from "path";

export function withRouter(children: ReactNode) {
    return <MemoryRouter>{children}</MemoryRouter>;
}

const timestamp = new Date("2025-04-04T14:52:56.879Z");

const artistHashMap: Record<
    string,
    Pick<Artist, "id" | "path" | "name" | "coverReleaseId">
> = {
    "6c3f3d3203630ce7": {
        id: 1,
        path: "A/Artist",
        name: "Artist",
        coverReleaseId: 1,
    },
};

export function getFakeArtistByHash(hash: string): Artist {
    const id = artistHashMap[hash].id;
    if (!id) {
        return getFakeArtist(1);
    }
    return getFakeArtist(id, hash);
}

export function getFakeArtist(id: number, hash?: string): Artist {
    const foundHash = Object.keys(artistHashMap).find(
        (hash) => artistHashMap[hash]?.id === id
    );

    const data = artistHashMap[foundHash] || ({} as Artist);

    id = id || data.id || 1;
    return {
        _type: "artist",
        id,
        name: "Artist",
        createdAt: timestamp,
        updatedAt: timestamp,
        hash: hash || `artist-hash-${id}`,
        path: "artist-path",
        coverReleaseId: 1,
        ...data,
    };
}

const releaseHashMap: Record<
    string,
    Pick<ReleaseWithArtist, "id" | "artist_id" | "title" | "year" | "path">
> = {
    e6ff3253fb407e5f: {
        id: 1,
        artist_id: 1,
        title: "Album One",
        path: "Album One",
        year: 1999,
    },
    b66649708b05af8e: {
        id: 2,
        artist_id: 1,
        title: "Album Two",
        path: "Album Two",
        year: 2000,
    },
};

export function getFakeReleaseByHash(hash: string): ReleaseWithArtist {
    const match = releaseHashMap[hash];
    if (!match) {
        return getFakeRelease(1);
    }
    return getFakeRelease(match.id, match.artist_id, hash);
}

export function getFakeRelease(
    release_id: number,
    artist_id?: number,
    hash?: string
): ReleaseWithArtist {
    const foundHash = Object.keys(releaseHashMap).find(
        (hash) => releaseHashMap[hash]?.id === release_id
    );

    const data = releaseHashMap[foundHash] || ({} as ReleaseWithArtist);

    artist_id = artist_id || data.artist_id || 1;

    return {
        _type: "release",
        id: release_id,
        path: "release-path",
        title: "release title",
        createdAt: timestamp,
        updatedAt: timestamp,
        hash: hash || foundHash || `release-hash-${release_id}`,
        year: 1999,
        type: "Album",
        discTitle: null,
        discNumber: 1,
        mainReleaseId: null,
        artist_id,
        artist: getFakeArtist(artist_id),
        ...data,
    };
}

export function getTrackPaths(length = 5) {
    return Array.from({ length }, (_, i) => getTrackPathFromIndex(i));
}

export function getTrackFromData(
    data: Pick<Track, "path" | "title" | "duration" | "position" | "hash"> & {
        releaseId?: number;
    }
): Track {
    return {
        _type: "track",
        id: parseInt(`${data?.releaseId || 1}${data.position}`),
        createdAt: timestamp,
        updatedAt: timestamp,
        releaseId: data.releaseId || 1,
        ...data,
    };
}

export function getFakeTrack(index = 0, track_id = 1, releaseId = 1): Track {
    const path = getTrackPathFromIndex(index);
    return {
        _type: "track",
        id: track_id,
        createdAt: timestamp,
        updatedAt: timestamp,
        releaseId,
        path,
        title: `Track ${index + 1}`,
        position: index + 1,
        duration: 123,
        hash: `track-hash-${track_id}`,
    };
}

function getTrackPathFromIndex(index = 1, extension = ".mp3") {
    return `${index < 9 ? "0" : ""}${index + 1} - track_${
        index + 1
    }${extension}`;
}

export const FULL_TRACKS = [
    {
        _type: "track",
        id: 11,
        createdAt: timestamp,
        updatedAt: timestamp,
        releaseId: 1,
        path: "01 - track_1.mp3",
        title: "Track 1",
        duration: 123,
        position: 1,
        hash: "2fbad3d560262706",
    },
    {
        _type: "track",
        id: 12,
        createdAt: timestamp,
        updatedAt: timestamp,
        releaseId: 1,
        path: "02 - track_2.mp3",
        title: "Track 2",
        duration: 123,
        position: 2,
        hash: "898229a56a967dab",
    },
    {
        _type: "track",
        id: 13,
        createdAt: timestamp,
        updatedAt: timestamp,
        releaseId: 1,
        path: "03 - track_3.mp3",
        title: "Track 3",
        duration: 123,
        position: 3,
        hash: "49d2b4621a291e4f",
    },
    {
        _type: "track",
        id: 14,
        createdAt: timestamp,
        updatedAt: timestamp,
        releaseId: 1,
        path: "04 - track_4.mp3",
        title: "Track 4",
        duration: 123,
        position: 4,
        hash: "556ac59172a802c3",
    },
    {
        _type: "track",
        id: 15,
        createdAt: timestamp,
        updatedAt: timestamp,
        releaseId: 1,
        path: "05 - track_5.mp3",
        title: "Track 5",
        duration: 123,
        position: 5,
        hash: "cb763ce03c4bcb15",
    },
];

const settings = {
    PLAYER_PATH: "PLAYER_PATH",
    TAGGER_PATH: "TAGGER_PATH",
    DISCOGS_KEY: "DISCOGS_KEY",
    DISCOGS_SECRET: "DISCOGS_SECRET",
    LIBRARY_PATH: "LIBRARY_PATH",
    COVERS_PATH: "COVERS_PATH",
} as const;

export function getSetting(key: keyof typeof settings) {
    return settings[key];
}

export function withPath(key: keyof typeof settings, folderPath: string) {
    return path.join(getSetting(key), folderPath);
}

export const send = vi.fn();
