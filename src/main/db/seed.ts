import prisma from "./prisma";
import {
  getFakeArtists,
  getFakeCollections,
  getFakeGroups,
  getFakeReleasesForArtist,
  getFakeTracksForRelease,
} from "@/test/seed";

async function main() {
  const artists = getFakeArtists({ length: 10 });
  const releases = artists.flatMap((x) => getFakeReleasesForArtist(x.id));
  await prisma.artist.createMany({ data: artists });
  await prisma.release.createMany({ data: releases });
  await prisma.track.createMany({
    data: releases.flatMap((r) => getFakeTracksForRelease(r.id)),
  });

  await Promise.all(
    getFakeGroups({ length: 3 }).map((x) =>
      prisma.group.create({
        data: {
          ...x,
          artists: { connect: artists.slice(0, 3).map(({ id }) => ({ id })) },
        },
      })
    )
  );

  await Promise.all(
    getFakeCollections({ length: 3 }).map((x, i) =>
      prisma.collection.create({
        data: {
          ...x,
          releases: {
            connect: Array.from({ length: 3 }, (_, j) => ({
              id: j + 1 + 3 * i,
            })),
          },
        },
      })
    )
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
