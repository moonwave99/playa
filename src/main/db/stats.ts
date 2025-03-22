import prisma from "./prisma";
import type { Entities } from "@/types/types";

export async function getStats(): Promise<Partial<Record<Entities, number>>> {
  const artists = await prisma.artist.aggregate({
    _count: { id: true },
  });

  const releases = await prisma.release.aggregate({
    _count: { id: true },
    where: { mainRelease: null }
  });

  const tracks = await prisma.track.aggregate({
    _count: { id: true },
  });

  const collections = await prisma.collection.aggregate({
    _count: { id: true },
  });

  return {
    artist: artists._count.id,
    release: releases._count.id,
    track: tracks._count.id,
    collection: collections._count.id,
  }
}