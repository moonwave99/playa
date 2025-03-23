import prisma from "./prisma";
import type { CollectionCreate, CollectionUpdate, HasId, PaginationParams } from '@/types/types';

export async function getCollections({ take = 50 }: PaginationParams) {
  const results = await prisma.collection.findMany({
    take,
    orderBy: { createdAt: "desc" },
    include: {
      releases: {
        include: {
          artist: true,
          subReleases: true,
          tracks: {
            orderBy: { position: "asc" },
          }
        }
      }
    },
  });
  return results;
}

export async function getCollection(id: number) {
  const result = await prisma.collection.findFirst({
    where: { id },
    include: {
      releases: {
        include: {
          artist: true,
          subReleases: {
            include: {
              tracks: {
                orderBy: { position: "asc" },
              }
            }
          },
          tracks: {
            orderBy: { position: "asc" },
          }
        }
      }
    },
  });
  return result;
}

export async function createCollection({ title, releases = [] }: CollectionCreate) {
  const result = await prisma.collection.create({
    data: {
      title,
      releases: { connect: releases.map(id => ({ id })) }
    }
  });
  return result;
}

export async function updateCollection(id: number, { title, releases }: CollectionUpdate) {
  const collection = await prisma.collection.findFirst({
    where: { id },
    include: {
      releases: true
    },
  });
  if (!collection) {
    return null;
  }
  const connect = releases.map(id => ({ id }))
  const disconnect = collection.releases.filter(({ id }: HasId) => releases.every(x => x != id))
  const result = await prisma.collection.update({
    where: {
      id
    },
    data: {
      title,
      releases: {
        connect,
        disconnect
      }
    }
  });
  return result;
}

export async function deleteCollection(id: number) {
  const result = await prisma.collection.delete({
    where: { id }
  });
  return result;
}