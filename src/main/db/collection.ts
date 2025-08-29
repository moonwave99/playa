import prisma from "./prisma";
import { withEntityType } from "@/types/types";
import type {
  CollectionCreate,
  CollectionUpdate,
  CollectionWithReleases,
  HasId,
  PaginationParams,
  Release,
  ReleaseWithArtist,
} from "@/types/types";

export async function getCollections({ take = 50 }: PaginationParams) {
  const results = await prisma.collection.findMany({
    take,
    orderBy: { updatedAt: "desc" },
    include: {
      coverRelease: {
        include: {
          artist: true,
          subReleases: true,
        },
      },
      releases: {
        include: {
          artist: true,
          additionalArtists: true,
          subReleases: true,
          tracks: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });
  return withEntityType(results, "collection");
}

export async function getAllCollections() {
  const result = await prisma.collection.findMany({
    orderBy: { title: "asc" },
    include: {
      releases: {
        select: {
          id: true,
        },
      },
    },
  });
  return withEntityType(result, "collection");
}

type SortParams = {
  sortBy: "default" | "title" | "year" | "artistName";
  order: "asc" | "desc";
};

const defaultSort = { sortBy: "artistName" as const, order: "asc" as const };

function getSort({ sortBy, order }: SortParams) {
  if (sortBy === "default") {
    return {};
  }
  if (sortBy === "artistName") {
    return {
      artist: { name: order },
    };
  }
  return {
    [sortBy]: order,
  };
}

export async function getCollection(id: number, sort = defaultSort) {
  const result = await prisma.collection.findFirst({
    where: { id },
    include: {
      releases: {
        orderBy: getSort(sort),
        include: {
          artist: true,
          additionalArtists: true,
          subReleases: {
            include: {
              tracks: {
                orderBy: { position: "asc" },
              },
            },
          },
          tracks: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });
  return result
    ? withEntityType(
        {
          ...result,
          releases: withEntityType(
            result.releases.map((x: ReleaseWithArtist) => ({
              ...x,
              artist: withEntityType(x.artist, "artist"),
              additionalArtists: withEntityType(x.additionalArtists, "artist"),
            })),
            "release"
          ),
        },
        "collection"
      )
    : null;
}

export async function createCollection({
  title,
  releases = [],
}: CollectionCreate) {
  const result = await prisma.collection.create({
    data: {
      title,
      releases: { connect: releases.map((id) => ({ id })) },
    },
  });
  return withEntityType(result, "collection");
}

export async function updateCollection(
  id: number,
  { title, releases }: CollectionUpdate
) {
  const collection = await prisma.collection.findFirst({
    where: { id },
    include: {
      releases: true,
    },
  });
  if (!collection) {
    return null;
  }
  const connect = releases.map((id) => ({ id }));
  const disconnect = collection.releases.filter(({ id }: HasId) =>
    releases.every((x) => x != id)
  );
  const result = await prisma.collection.update({
    where: {
      id,
    },
    data: {
      title,
      releases: {
        connect,
        disconnect,
      },
    },
  });
  return withEntityType(result, "collection");
}

export async function addReleasesToCollection(id: number, releases: Release[]) {
  const result = await prisma.collection.update({
    where: {
      id,
    },
    data: {
      releases: {
        connect: releases.map(({ id }) => ({ id })),
      },
    },
  });
  return withEntityType(result, "collection");
}

export async function removeReleasesFromCollection(
  id: number,
  release_ids: number[]
): Promise<CollectionWithReleases> {
  let result = await prisma.collection.update({
    where: {
      id,
    },
    data: {
      releases: {
        disconnect: release_ids.map((id) => ({ id })),
      },
    },
    include: {
      releases: {
        select: {
          id: true,
        },
      },
    },
  });
  if (release_ids.includes(result.coverReleaseId)) {
    result = await prisma.collection.update({
      where: { id },
      data: {
        coverReleaseId: null,
      },
    });
  }
  return withEntityType(result, "collection");
}

export async function deleteCollections(ids: number[]) {
  return Promise.all(ids.map(deleteCollection));
}

export async function deleteCollection(id: number) {
  const result = await prisma.collection.delete({
    where: { id },
  });
  return result;
}

export async function setCollectionCoverRelease(
  collection_id: number,
  release_id: number
) {
  const result = await prisma.collection.update({
    where: { id: collection_id },
    data: { coverReleaseId: release_id },
  });
  return withEntityType(result, "collection");
}
