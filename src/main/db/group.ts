import prisma from "./prisma";
import { withEntityType } from "@/types/types";
import type {
  GroupCreate,
  GroupUpdate,
  HasId,
  PaginationParams,
} from "@/types/types";

export async function getGroups({ take = 50 }: PaginationParams) {
  const results = await prisma.group.findMany({
    take,
    orderBy: { updatedAt: "desc" },
    include: {
      coverArtist: {
        include: {
          coverRelease: {
            include: {
              artist: true,
            },
          },
          releases: {
            take: 1,
            where: {
              mainRelease: null,
            },
            include: {
              artist: true,
            },
          },
        },
      },
      artists: {
        include: {
          coverRelease: {
            include: {
              artist: true,
            },
          },
          releases: {
            take: 1,
            where: {
              mainRelease: null,
            },
            include: {
              artist: true,
            },
          },
        },
      },
    },
  });
  return withEntityType(
    results.map((x) => ({
      ...x,
      artists: withEntityType(x.artists, "artist"),
    })),
    "group"
  );
}

export async function getAllGroups() {
  const result = await prisma.group.findMany({
    orderBy: { title: "asc" },
    include: {
      artists: {
        select: {
          id: true,
        },
      },
    },
  });
  return withEntityType(result, "group");
}

export async function getGroup(id: number) {
  const result = await prisma.group.findFirst({
    where: { id },
    include: {
      artists: {
        orderBy: { name: "asc" },
        include: {
          coverRelease: {
            include: {
              artist: true,
            },
          },
          releases: {
            where: {
              mainRelease: null,
            },
            include: {
              artist: true,
            },
          },
        },
      },
    },
  });

  return result
    ? withEntityType(
        { ...result, artists: withEntityType(result.artists, "artist") },
        "group"
      )
    : null;
}

export async function createGroup({ title, artists = [] }: GroupCreate) {
  const result = await prisma.group.create({
    data: {
      title,
      artists: { connect: artists.map((id) => ({ id })) },
    },
  });
  return withEntityType(result, "group");
}

export async function updateGroup(id: number, { title, artists }: GroupUpdate) {
  const group = await prisma.group.findFirst({
    where: { id },
    include: {
      artists: true,
    },
  });
  if (!group) {
    return null;
  }
  const connect = artists.map((id) => ({ id }));
  const disconnect = group.artists
    .filter(({ id }: HasId) => artists.every((x) => x != id))
    .map(({ id }: HasId) => ({ id }));

  const result = await prisma.group.update({
    where: {
      id,
    },
    data: {
      title,
      artists: {
        connect,
        disconnect,
      },
    },
  });
  return withEntityType(result, "group");
}

export async function addArtistsToGroup(id: number, artists: HasId[]) {
  const result = await prisma.group.update({
    where: {
      id,
    },
    data: {
      artists: {
        connect: artists.map(({ id }) => ({ id })),
      },
    },
  });
  return withEntityType(result, "group");
}

export async function removeArtistsFromGroup(id: number, artist_ids: number[]) {
  let result = await prisma.group.update({
    where: { id },
    data: {
      artists: {
        disconnect: artist_ids.map((id) => ({ id })),
      },
    },
    include: {
      artists: {
        select: {
          id: true,
        },
      },
    },
  });

  if (artist_ids.includes(result.coverArtistId)) {
    result = await prisma.group.update({
      where: { id },
      data: {
        coverArtistId: null,
      },
      include: {
        artists: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  return withEntityType(result, "group");
}

export async function deleteGroups(ids: number[]) {
  return prisma.group.deleteMany({ where: { id: { in: ids } } });
}

export async function deleteGroup(id: number) {
  return prisma.group.delete({
    where: { id },
  });
}

export async function setGroupCoverArtist(group_id: number, artist_id: number) {
  const result = await prisma.group.update({
    where: { id: group_id },
    data: { coverArtistId: artist_id },
  });
  return withEntityType(result, "group");
}
