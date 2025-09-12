import prisma from "../db/prisma";
import { dialog } from "electron";
import path from "path";
import fsExtra, { pathExists } from "fs-extra";
import { artistController } from "./artist";
import { testFs } from "@moonwave99/test-fs";
import { StateManager } from "../state";
import { clearPrisma } from "@/test/prisma-utils";
import {
  getFakeArtist,
  getFakeArtists,
  getFakeReleasesForArtist,
} from "@/test/seed";
import { withPath } from "@/test/utils";

afterEach(clearPrisma);

const defaultParams = {
  withPath,
  state: {} as unknown as StateManager,
  send: vi.fn(),
};

describe("artist - getArtist function", () => {
  it("returns null if no artist is found", async () => {
    const { getArtist } = artistController(defaultParams);
    const result = await getArtist(1);
    expect(result).toBe(null);
  });

  it("returns the artist if found", async () => {
    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });
    const { getArtist } = artistController(defaultParams);
    const result = await getArtist(1);
    expect(result).toMatchObject(artist);
  });
});

describe("artist - getAllArtists function", () => {
  it("returns all the artists", async () => {
    const artists = getFakeArtists({ length: 5 });
    await prisma.artist.createMany({ data: artists });
    const { getAllArtists } = artistController(defaultParams);
    const result = await getAllArtists();
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    expect(result).toMatchObject(artists.map(({ createdAt, ...x }) => x));
  });
});

describe("artist - getLatestArtists function", () => {
  it("returns the latest added artists in chronological reversed order", async () => {
    const artists = getFakeArtists({ length: 5 });
    await prisma.artist.createMany({ data: artists });
    const { getLatestArtists } = artistController(defaultParams);
    const result = await getLatestArtists({
      take: 50,
      skip: 0,
    });
    expect(result).toMatchObject({
      pagination: {
        take: 50,
        skip: 0,
        total: artists.length,
      },
      results: artists.toReversed(),
    });
  });
});

describe("artist - editArtist function", () => {
  it("shows a warning if the new path already exists", async (context) => {
    const directory = await testFs(
      { "/LIBRARY_PATH/A/Artist New": {} },
      context.task.id
    );
    const state = { setCurrentArtist: vi.fn() } as unknown as StateManager;
    const { editArtist } = artistController({
      ...defaultParams,
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
      state,
    });

    const moveSpy = vi.spyOn(fsExtra, "move");
    const dialogSpy = vi.spyOn(dialog, "showMessageBoxSync");
    const artist = getFakeArtist();
    await prisma.artist.create({ data: artist });

    const result = await editArtist({
      ...artist,
      newName: "Artist New",
      newPath: "A/Artist New",
    });

    expect(dialogSpy).toHaveBeenCalledWith(null, {
      message: "Error while renaming",
      detail: `Path A/Artist New already exists`,
      type: "error",
      buttons: ["OK"],
    });

    expect(result).toBe(false);
    expect(moveSpy).not.toHaveBeenCalled();
    expect(state.setCurrentArtist).not.toHaveBeenCalled();
  });

  it("updates the artist with the given information", async (context) => {
    const artist = getFakeArtist();
    const directory = await testFs(
      { "/LIBRARY_PATH/A/Artist 1": {} },
      context.task.id
    );
    const state = {
      setCurrentArtist: vi.fn(),
      getCurrentArtist: () => artist,
    } as unknown as StateManager;
    const send = vi.fn();
    const { editArtist } = artistController({
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
      state,
      send,
    });

    await prisma.artist.create({ data: artist });

    const result = await editArtist({
      ...artist,
      newName: "Artist New",
      newPath: "A/Artist New",
    });

    const previousPath = path.join(directory, "LIBRARY_PATH/A/Artist");
    const newPath = path.join(directory, "LIBRARY_PATH/A/Artist New");

    expect(result).toBeTruthy();

    expect(await pathExists(previousPath)).toBe(false);
    expect(await pathExists(newPath)).toBe(true);

    expect(state.setCurrentArtist).toHaveBeenCalled();

    expect(send).toHaveBeenCalledWith("notify", {
      message: `Artist folder moved to ${newPath}`,
      type: "info",
    });
  });
});

describe("artist - setArtistCoverRelease function", () => {
  it("sets the artist cover release", async () => {
    const artist = getFakeArtist();
    const release = getFakeReleasesForArtist(artist.id).at(0);
    await prisma.artist.create({ data: artist });
    await prisma.release.create({ data: release });

    const { setArtistCoverRelease } = artistController(defaultParams);

    await setArtistCoverRelease(artist.id, release.id);
    const updatedArtist = await prisma.artist.findFirst({
      where: { id: artist.id },
    });

    expect(updatedArtist.coverReleaseId).toBe(release.id);
  });
});

describe("artist - addRelatedArtist function", () => {
  it("adds a related artist", async () => {
    const artists = getFakeArtists({ length: 2 });
    await prisma.artist.createMany({ data: artists });

    const { addRelatedArtist } = artistController(defaultParams);

    await addRelatedArtist(artists[1].id, artists[0].id);

    const updatedArtist = await prisma.artist.findFirst({
      where: { id: artists[0].id },
      include: { relatedArtists: true, symmetricRelatedArtists: true },
    });

    const addedArtist = await prisma.artist.findFirst({
      where: { id: artists[1].id },
      include: { relatedArtists: true, symmetricRelatedArtists: true },
    });

    expect(updatedArtist.relatedArtists).toMatchObject([artists[1]]);
    expect(addedArtist.relatedArtists).toMatchObject([artists[0]]);
  });
});

describe("artist - removeRelatedArtist function", () => {
  it("removes a related artist", async () => {
    const artists = getFakeArtists({ length: 3 });
    await prisma.artist.createMany({ data: artists });

    const { addRelatedArtist, removeRelatedArtist } =
      artistController(defaultParams);

    await addRelatedArtist(artists[1].id, artists[0].id);
    await addRelatedArtist(artists[2].id, artists[0].id);
    await removeRelatedArtist(artists[1].id, artists[0].id);

    const updatedArtist = await prisma.artist.findFirst({
      where: { id: artists[0].id },
      include: { relatedArtists: true, symmetricRelatedArtists: true },
    });

    const removedArtist = await prisma.artist.findFirst({
      where: { id: artists[1].id },
      include: { relatedArtists: true, symmetricRelatedArtists: true },
    });

    expect(updatedArtist.relatedArtists.map((x) => x.id)).toMatchObject([3]);
    expect(removedArtist.relatedArtists).toMatchObject([]);
  });
});

describe("artist - searchArtists function", () => {
  it("returns the artists that match the passed appearsIn exclude query", async () => {
    const artists = getFakeArtists({ length: 9 });
    await prisma.artist.createMany({ data: artists });
    await prisma.release.createMany({ data: getFakeReleasesForArtist(1) });

    await prisma.release.update({
      where: { id: 1 },
      data: {
        additionalArtists: {
          connect: { id: 1 },
        },
      },
    });

    const { searchArtists } = artistController(defaultParams);

    const results = await searchArtists({
      query: "Art",
      take: 50,
      exclude: { key: "appearsIn", artist_id: 2, release_id: 1 },
    });

    expect(results).toMatchObject(artists.slice(2));
  });

  it("returns the artists that match the passed relatedArtists exclude query", async () => {
    const artists = getFakeArtists({ length: 9 });
    await prisma.artist.createMany({ data: artists });

    const { searchArtists, addRelatedArtist } = artistController(defaultParams);

    await addRelatedArtist(1, 2);

    const results = await searchArtists({
      query: "Art",
      take: 50,
      exclude: { key: "relatedArtists", artist_id: 1 },
    });

    expect(results).toMatchObject(artists.slice(1));
  });
});
