import prisma from "../db/prisma";
import { clearPrisma } from "../../test/prisma-utils";
import { collectionController } from "./collection";
import { sortBy } from "@/lib/utils";
import {
  getFakeCollection,
  getFakeCollections,
  getFakeArtists,
  getFakeReleasesForArtist,
  getFakeArtist,
} from "../../test/seed";
import { type StateManager } from "../stateManager";
import { CollectionWithReleases } from "@/types/types";

afterEach(clearPrisma);

const defaultParams = {
  send: vi.fn(),
  openConfirmDialog: () => true,
  stateManager: {
    setSelection: vi.fn(),
  } as unknown as StateManager,
};

describe("getAllCollections function", () => {
  it("returns all the collections", async () => {
    const collections = getFakeCollections({ length: 2 });
    await prisma.collection.createMany({ data: collections });
    const { getAllCollections } = collectionController(defaultParams);
    const result = await getAllCollections();
    expect(result).toMatchObject(collections);
  });
});

describe("getCollectionAlphabeticalList function", () => {
  it("returns all the artists grouped by letter", async () => {
    const collections = getFakeCollections({ length: 5 });
    await prisma.collection.createMany({ data: collections });
    const { getCollectionAlphabeticalList } =
      collectionController(defaultParams);
    const result = await getCollectionAlphabeticalList();
    expect(result).toMatchObject([["c", collections]]);
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

    const { getCollection } = collectionController(defaultParams);
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
    const { getCollections } = collectionController(defaultParams);
    const result = await getCollections({ take: 5 });
    expect(result.length).toBe(5);
  });

  it("returns max 50 collections if no take parameter is specified", async () => {
    await prisma.collection.createMany({ data: collections });
    const { getCollections } = collectionController(defaultParams);
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
    const { setCollectionCoverRelease } = collectionController(defaultParams);
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

    const send = vi.fn();

    const { addReleasesToCollection } = collectionController({
      ...defaultParams,
      send,
    });
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

    expect(send).toHaveBeenCalledWith("notify", {
      type: "success",
      message: "Releases added to Collection",
    });
  });
});

describe("addReleasesToNewCollection function", () => {
  it("adds the releases by given ids to a new collection", async () => {
    const artist = getFakeArtists({ length: 1 }).at(0);
    const releases = getFakeReleasesForArtist(artist.id);

    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });

    const { addReleasesToNewCollection } = collectionController(defaultParams);
    await addReleasesToNewCollection("new collection", releases);
    const newCollection = await prisma.collection.findFirst({
      where: { id: 1 },
      include: { releases: true },
    });

    expect(newCollection.title).toBe("new collection");

    expect(newCollection.releases).toMatchObject([
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

    const { createCollection } = collectionController(defaultParams);
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
  it("does nothing if the dialog is dismissed", async () => {
    const collection = getFakeCollections({ length: 1 }).at(0);
    await prisma.collection.create({ data: collection });

    const send = vi.fn();

    const { deleteCollection } = collectionController({
      ...defaultParams,
      send,
      openConfirmDialog: () => false,
    });
    await deleteCollection(1);
    const result = await prisma.collection.findFirst({ where: { id: 1 } });

    expect(result).not.toBe(null);
    expect(send).not.toHaveBeenCalled();
  });

  it("deletes a collection by the given id", async () => {
    const collection = getFakeCollections({ length: 1 }).at(0);
    await prisma.collection.create({ data: collection });

    const { deleteCollection } = collectionController(defaultParams);
    await deleteCollection(1);
    const result = await prisma.collection.findFirst({ where: { id: 1 } });

    expect(result).toBe(null);
  });
});

describe("deleteCollections function", () => {
  it("does nothing if the dialog is dismissed", async () => {
    const collections = getFakeCollections({ length: 3 });
    await prisma.collection.createMany({ data: collections });

    const send = vi.fn();

    const { deleteCollections } = collectionController({
      ...defaultParams,
      send,
      openConfirmDialog: () => false,
    });
    await deleteCollections([2, 3]);
    const result = await prisma.collection.findMany();

    expect(result).toMatchObject(collections);
    expect(send).not.toHaveBeenCalled();
  });

  it("deletes all collections by the given ids", async () => {
    const collections = getFakeCollections({ length: 3 });
    await prisma.collection.createMany({ data: collections });

    const send = vi.fn();

    const { deleteCollections } = collectionController({
      ...defaultParams,
      send,
    });
    await deleteCollections([2, 3]);
    const result = await prisma.collection.findMany();

    expect(result).toMatchObject(collections.slice(0, 1));

    expect(send).toHaveBeenCalledWith("mutate", [
      ["collections", "latest"],
      ["collections", 2],
      ["collections", 3],
    ]);

    expect(send).toHaveBeenCalledWith("notify", {
      type: "success",
      message: "2 Collection deleted from Library",
    });
  });
});

describe("updateCollection function", () => {
  it("does nothing if no collection is found", async () => {
    const send = vi.fn();
    const { updateCollection } = collectionController({
      ...defaultParams,
      send,
    });
    const result = await updateCollection(1, {
      title: "new title",
      releases: [],
    });
    expect(result).toBe(null);
    expect(send).not.toHaveBeenCalled();
  });

  it("updates the collection", async () => {
    const artist = getFakeArtists({ length: 1 }).at(0);
    const releases = getFakeReleasesForArtist(artist.id);
    const collection = getFakeCollections({ length: 1 }).at(0);

    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });
    await prisma.collection.create({ data: collection });

    const send = vi.fn();

    const { updateCollection } = collectionController({
      ...defaultParams,
      send,
    });

    const result = await updateCollection(1, {
      title: "new title",
      releases: releases.map(({ id }) => id),
    });

    expect(result).toMatchObject({
      title: "new title",
      releases: releases.map(({ id }) => ({ id })),
    });

    expect(send).toHaveBeenCalledWith("notify", {
      type: "success",
      message: "Collection updated",
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

    const { removeReleasesFromCollection } = collectionController({
      ...defaultParams,
      openConfirmDialog: () => false,
    });
    await removeReleasesFromCollection(1, [2]);

    const result = await prisma.collection.findFirst({
      where: { id: 1 },
      include: { releases: true },
    });

    expect(result.releases.length).toBe(5);
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
    const { removeReleasesFromCollection } =
      collectionController(defaultParams);
    const updatedCollection = (await removeReleasesFromCollection(
      1,
      [2, 4]
    )) as CollectionWithReleases;
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
    const { removeReleasesFromCollection } =
      collectionController(defaultParams);
    const updatedCollection = (await removeReleasesFromCollection(1, [
      2,
    ])) as CollectionWithReleases;
    expect(updatedCollection.coverReleaseId).toBe(null);
  });
});
