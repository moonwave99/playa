import prisma from "./prisma";
import sha1 from "sha1";

import { withEntityType } from "@/types/types";
import type {
    HasId,
    TrackInfo,
    PaginationParams,
    Release,
    WithSubReleases,
    ReleaseWithArtistAndSubreleases,
} from '@/types/types';

import { parsePath } from "../system";

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
                    discNumber: 'asc'
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
            hash: sha1(`${id}-${track.path}`).slice(0, 16),
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
            artist: true,
            tracks: {
                orderBy: {
                    position: 'asc'
                }
            }
        },
    });
    return withEntityType(result, 'release');
}

type GroupReleaseParams = {
    mainRelease: {
        id: number;
        title: string;
    },
    discInfo: { id: number, title: string; number: number }[];
};

export async function groupReleases({ mainRelease, discInfo }: GroupReleaseParams) {
    await prisma.$transaction([
        ...discInfo.slice(1).map(({ id, title, number }) => prisma.release.update({
            where: { id },
            data: {
                title: mainRelease.title,
                mainReleaseId: mainRelease.id,
                discTitle: title,
                discNumber: number
            }
        })),
        prisma.release.update({
            where: {
                id: mainRelease.id,
            },
            data: {
                title: mainRelease.title,
                discTitle: discInfo[0].title,
                discNumber: 1,
                subReleases: {
                    connect: discInfo.slice(1).map(({ id }) => ({ id }))
                }
            }
        })
    ]);
}

export async function unGroupRelease(release: Release & WithSubReleases) {
    const info = parsePath(release.path);
    await prisma.$transaction([
        prisma.release.update({
            where: {
                id: release.id
            },
            data: {
                title: info.title,
                discNumber: null,
                discTitle: null,
                subReleases: {
                    set: []
                },
            }
        }),
        ...release.subReleases.map(({ id, path }) => {
            const info = parsePath(path);
            return prisma.release.update({
                where: {
                    id
                },
                data: {
                    mainReleaseId: null,
                    title: info.title,
                    discNumber: null,
                    discTitle: null
                }
            })
        })
    ]);
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

type RenameReleaseParam = Pick<Release,
    'id' | 'title' | 'path' | 'hash' | 'discTitle' | 'discNumber' | 'type' | 'year'
>[]

export async function updateReleases(infos: RenameReleaseParam) {
    return prisma.$transaction(
        infos.map(({ id, title, path, hash, discTitle, discNumber, type, year }) => prisma.release.update({
            where: { id },
            data: { title, path, hash, discTitle, discNumber, type, year }
        }))
    );
}