import prisma from "./prisma";
import sha1 from "sha1";
import { withEntityType } from "@/types/types";
import type {
    HasId,
    TrackInfo,
    PaginationParams,
    SearchResult,
    Release,
    Artist,
    Collection,
    HasTitle,
    WithSubReleases,
    ReleaseWithArtistAndSubreleases
} from '@/types/types';

import { sortByQueryPosition, getReleaseTitle } from '@/lib/utils'

export async function getRelease(id: number) {
    const result = await prisma.release.findFirst({
        where: { id },
        include: {
            artist: true,
            subReleases: {
                include: {
                    artist: true,
                    tracks: {
                        orderBy: {
                            position: 'asc'
                        }
                    }
                },
                orderBy: {
                    disc: 'asc'
                }
            },
            mainRelease: true,
            tracks: { orderBy: { position: 'asc' } }
        },
    });
    return withEntityType(result, 'release');
}

export async function deleteRelease(id: number) {
    const release = await prisma.release.findFirst({
        where: { id },
        include: {
            subReleases: true
        }
    });
    if (!release) {
        return;
    }
    await prisma.release.deleteMany({
        where: {
            id: {
                in: [id, ...release.subReleases.map(({ id }: HasId) => id)]
            }
        }
    });
}

export async function deleteReleases(ids: number[]) {
    return Promise.all(ids.map(deleteRelease));
}

export async function addTracksToRelease(id: number, trackInfo: TrackInfo[]) {
    await prisma.track.deleteMany({
        where: {
            releaseId: id
        }
    });

    const tracks = await Promise.all(trackInfo.map(track => prisma.track.create({
        data: {
            ...track,
            hash: sha1(track.path).slice(0, 16),
            releaseId: id
        }
    })));

    const result = await prisma.release.update({
        where: {
            id
        },
        data: {
            tracks: {
                connect: tracks.map(x => ({ id: x.id }))
            }
        },
        include: {
            artist: true, tracks: {
                orderBy: {
                    position: 'asc'
                }
            }
        },
    });
    return withEntityType(result, 'release');
}

export async function groupReleases(release_id: number, subReleases: number[]) {
    await Promise.all(subReleases.map(id => prisma.release.update({
        where: { id },
        data: {
            mainReleaseId: release_id
        }
    })));
    const result = await prisma.release.update({
        where: {
            id: release_id
        },
        data: {
            subReleases: {
                connect: subReleases.map(x => ({ id: x }))
            }
        }
    })
    return withEntityType(result, 'release');
}

export async function unGroupReleases(release: Release & WithSubReleases) {
    await prisma.$transaction([
        prisma.release.update({
            where: {
                id: release.id
            },
            data: {
                subReleases: {
                    set: []
                }
            }
        }),
        ...release.subReleases.map(({ id }) => prisma.release.update({
            where: {
                id
            },
            data: {
                mainReleaseId: null
            }
        }))
    ]);
}

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
            subReleases: true
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
    });

    const collections = await prisma.collection.findMany({
        take,
        where: {
            title: {
                contains: query,
                mode: "insensitive",
            },
        },
    });

    return [
        ...collections.map(({ id, title }: Collection) => ({
            id,
            title,
            description: "Collection",
            type: 'collection' as const,
            links: {
                collection: `/collections/${id}`
            }
        })).toSorted((a: HasTitle, b: HasTitle) => sortByQueryPosition(query, 'title', a, b)),
        ...artists.map(({ id, name }: Artist) => ({
            id,
            title: name,
            description: 'Artist',
            type: 'artist' as const,
            links: {
                artist: `/artists/${id}`
            }
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

export async function getLatestReleases(
    { take = 50, skip = 0 }: PaginationParams
) {
    const [results, total] = await prisma.$transaction([
        prisma.release.findMany({
            take,
            skip,
            orderBy: { createdAt: "desc" },
            include: { artist: true, subReleases: true, mainRelease: true },
            where: {
                mainRelease: null
            }
        }),
        prisma.release.count()
    ]);
    return {
        pagination: {
            take,
            skip,
            total
        },
        results: withEntityType(results, 'release') as ReleaseWithArtistAndSubreleases[]
    };
}