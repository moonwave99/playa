import prisma from "./prisma";
import type {
  CollectionCreate,
  CollectionUpdate,
  HasId,
  PaginationParams,
} from "@/types/types";

export async function getCollections({ take = 50 }: PaginationParams) {
  return prisma.collection.findMany({
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
}

export async function getAllCollections() {
  return prisma.collection.findMany({
    orderBy: { title: "asc" },
    include: {
      releases: {
        select: {
          id: true,
        },
      },
    },
  });
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

export async function getCollection(
  id: number,
  sort: SortParams = defaultSort
) {
  return prisma.collection.findFirst({
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
}

export async function createCollection({
  title,
  releases = [],
}: CollectionCreate) {
  return prisma.collection.create({
    data: {
      title,
      releases: { connect: releases.map((id) => ({ id })) },
    },
  });
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
  return prisma.collection.update({
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
    include: {
      releases: {
        select: { id: true },
      },
    },
  });
}

export async function addReleasesToNewCollection(
  title: string,
  releases: HasId[]
) {
  return prisma.collection.create({
    data: {
      title,
      releases: {
        connect: releases.map(({ id }) => ({ id })),
      },
      coverReleaseId: releases.at(0).id,
    },
  });
}

export async function addReleasesToCollection(id: number, releases: HasId[]) {
  return prisma.collection.update({
    where: {
      id,
    },
    data: {
      releases: {
        connect: releases.map(({ id }) => ({ id })),
      },
    },
  });
}

export async function removeReleasesFromCollection(
  id: number,
  release_ids: number[]
) {
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
      include: {
        releases: {
          select: {
            id: true,
          },
        },
      },
    });
  }
  return result;
}

export async function deleteCollection(id: number) {
  return prisma.collection.delete({ where: { id } });
}

export async function deleteCollections(ids: number[]) {
  return prisma.collection.deleteMany({ where: { id: { in: ids } } });
}

export async function setCollectionCoverRelease(
  collection_id: number,
  release_id: number
) {
  return prisma.collection.update({
    where: { id: collection_id },
    data: { coverReleaseId: release_id },
  });
}
