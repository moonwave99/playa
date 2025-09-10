import prisma from "../db/prisma";
import { clearPrisma } from "../../test/prisma-utils";
import { dialog } from "electron";
import { collectionController } from "./collection";
import { sortBy } from "@/lib/utils";
import {
  getFakeCollection,
  getFakeCollections,
  getFakeArtists,
  getFakeReleasesForArtist,
  getFakeArtist,
} from "../../test/seed";

afterEach(clearPrisma);

describe("getAllCollections function", () => {
  it("returns all the collections", async () => {
    const collections = getFakeCollections({ length: 2 });
    await prisma.collection.createMany({ data: collections });
    const { getAllCollections } = collectionController();
    const result = await getAllCollections();
    expect(result).toMatchObject(collections);
  });
});

describe("getCollection function", () => {
  it("returns the collection by given id", async () => {
    const collection = getFakeCollection();
    const releases = getFakeReleasesForArtist(1);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.createMany({ data: releases });
    await prisma.collection.create({
      data: {
        ...collection,
        releases: { connect: releases.map((x) => ({ id: x.id })) },
      },
    });

    const { getCollection } = collectionController();
    {
      const result = await getCollection(1);
      expect(result.releases).toMatchObject(releases);
    }
    {
      const result = await getCollection(1, {
        sortBy: "title",
        order: "asc",
      });
      expect(result.releases).toMatchObject(releases);
    }
    {
      const result = await getCollection(1, {
        sortBy: "title",
        order: "desc",
      });
      expect(result.releases).toMatchObject(
        releases.toSorted(sortBy("title", "desc"))
      );
    }
  });
});

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
    await prisma.collection.create({ data: collection });

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

describe("createCollection function", () => {
  it("creates a new collection", async () => {
    const artist = getFakeArtists({ length: 1 }).at(0);
    const releases = getFakeReleasesForArtist(artist.id);

    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });

    const { createCollection } = collectionController();
    const newCollection = await createCollection({
      title: "new collection",
      releases: releases.map(({ id }) => id),
    });

    expect(newCollection.title).toBe("new collection");

    const result = await prisma.collection.findFirst({
      where: { id: 1 },
      include: { releases: true },
    });

    expect(result.releases).toMatchObject(releases);
  });
});

describe("deleteCollection function", () => {
  it("deletes a collection by the given id", async () => {
    const collection = getFakeCollections({ length: 1 }).at(0);
    await prisma.collection.create({ data: collection });

    const { deleteCollection } = collectionController();
    await deleteCollection(1);
    const result = await prisma.collection.findFirst({ where: { id: 1 } });

    expect(result).toBe(null);
  });
});

describe("deleteCollections function", () => {
  it("deletes all collections by the given ids", async () => {
    const collections = getFakeCollections({ length: 3 });
    await prisma.collection.createMany({ data: collections });

    const { deleteCollections } = collectionController();
    await deleteCollections([2, 3]);
    const result = await prisma.collection.findMany();

    expect(result).toMatchObject(collections.slice(0, 1));
  });
});

describe("updateCollection function", () => {
  it("updates the collection", async () => {
    const artist = getFakeArtists({ length: 1 }).at(0);
    const releases = getFakeReleasesForArtist(artist.id);
    const collection = getFakeCollections({ length: 1 }).at(0);

    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });
    await prisma.collection.create({ data: collection });

    const { updateCollection } = collectionController();

    const result = await updateCollection(1, {
      title: "new title",
      releases: releases.map(({ id }) => id),
    });

    expect(result).toMatchObject({
      title: "new title",
      releases: releases.map(({ id }) => ({ id })),
    });
  });
});

describe("removeReleasesFromCollection function", () => {
  const artist = getFakeArtists({ length: 1 }).at(0);
  const releases = getFakeReleasesForArtist(artist.id);
  const collection = getFakeCollections({ length: 1 }).at(0);

  it("does nothing if the cancel button is pressed", async () => {
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

    const dialogSpy = vi.spyOn(dialog, "showMessageBoxSync");
    dialogSpy.mockReturnValueOnce(1);

    const { removeReleasesFromCollection } = collectionController();
    await removeReleasesFromCollection(1, [2]);

    const result = await prisma.collection.findFirst({
      where: { id: 1 },
      include: { releases: true },
    });

    expect(result.releases.length).toBe(5);

    dialogSpy.mockReset();
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
