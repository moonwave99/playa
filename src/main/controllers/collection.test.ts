import prisma from "../db/prisma";
import { collectionController } from "./collection";
import {
  getFakeCollections,
  getFakeArtists,
  getFakeReleasesForArtist,
} from "../../test/seed";

import { clearPrisma } from "../../test/prisma-utils";

afterEach(clearPrisma);

describe("getCollections function", () => {
  const collections = getFakeCollections({ length: 100 });

  it("returns as many collections as per the take parameter", async () => {
    await prisma.collection.createMany({ data: collections });
    const { getCollections } = collectionController();
    const result = await getCollections({ take: 5 });
    expect(result.length).toBe(5);
  });

  it("returns max 50 collections if no take parameter is specified", async () => {
    await prisma.collection.createMany({ data: collections });
    const { getCollections } = collectionController();
    const result = await getCollections({});
    expect(result.length).toBe(50);
  });
});

describe("setCollectionCoverRelease function", () => {
  it("set the passed release as cover for the collection", async () => {
    const artist = getFakeArtists({ length: 1 }).at(0);
    const releases = getFakeReleasesForArtist(artist.id);
    const collection = getFakeCollections({ length: 1 }).at(0);

    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });
    await prisma.collection.create({
      data: {
        ...collection,
        releases: {
          connect: releases.map((x) => ({ id: x.id })),
        },
      },
    });
    const { setCollectionCoverRelease } = collectionController();
    await setCollectionCoverRelease(1, 2);
    const updatedCollection = await prisma.collection.findFirst({
      where: { id: 1 },
    });
    expect(updatedCollection.coverReleaseId).toBe(2);
  });
});

describe("addReleasesToCollection function", () => {
  it("adds the releases by given ids to the collection", async () => {
    const artist = getFakeArtists({ length: 1 }).at(0);
    const releases = getFakeReleasesForArtist(artist.id);
    const collection = getFakeCollections({ length: 1 }).at(0);

    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });
    await prisma.collection.create({
      data: collection,
    });
    const { addReleasesToCollection } = collectionController();
    await addReleasesToCollection(1, releases);
    const updatedCollection = await prisma.collection.findFirst({
      where: { id: 1 },
      include: { releases: true },
    });

    expect(updatedCollection.releases).toMatchObject([
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
    ]);
  });
});

describe("removeReleasesFromCollection function", () => {
  const artist = getFakeArtists({ length: 1 }).at(0);
  const releases = getFakeReleasesForArtist(artist.id);
  const collection = getFakeCollections({ length: 1 }).at(0);

  it("adds the releases by given ids to the collection", async () => {
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });
    await prisma.collection.create({
      data: collection,
    });
    const { addReleasesToCollection } = collectionController();
    await addReleasesToCollection(1, releases);
    const updatedCollection = await prisma.collection.findFirst({
      where: { id: 1 },
      include: { releases: true },
    });

    expect(updatedCollection.releases).toMatchObject([
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
    ]);
  });

  it("removes the releases by given ids from the collection", async () => {
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });
    await prisma.collection.create({
      data: {
        ...collection,
        releases: {
          connect: releases.map((x) => ({ id: x.id })),
        },
      },
    });
    const { removeReleasesFromCollection } = collectionController();
    const updatedCollection = await removeReleasesFromCollection(1, [2, 4]);
    expect(updatedCollection.releases).toMatchObject([
      { id: 1 },
      { id: 3 },
      { id: 5 },
    ]);
  });

  it("sets the cover release to empty if the current cover release is removed", async () => {
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });
    await prisma.collection.create({
      data: {
        ...collection,
        releases: {
          connect: releases.map((x) => ({ id: x.id })),
        },
        coverReleaseId: 2,
      },
    });
    const { removeReleasesFromCollection } = collectionController();
    const updatedCollection = await removeReleasesFromCollection(1, [2]);
    expect(updatedCollection.coverReleaseId).toBe(null);
  });
});
