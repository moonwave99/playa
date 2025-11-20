import path from "node:path";
import prisma from "../db/prisma";
import { artistController } from "./artist";
import { getSetting, withPath } from "@/test/utils";
import { clearPrisma } from "@/test/prisma-utils";
import {
  getFakeArtist,
  getFakeArtists,
  getFakeReleasesForArtist,
} from "@/test/seed";
import { type StateManager } from "../stateManager";
import { testFs } from "@moonwave99/test-fs";

afterEach(clearPrisma);

const defaultParams = {
  getSetting,
  withPath,
  send: vi.fn(),
  showErrorBox: vi.fn(),
  openConfirmDialog: vi.fn(),
  openFolderDialog: vi.fn(),
  stateManager: {
    setSelection: vi.fn(),
  } as unknown as StateManager,
};

describe("artist - getArtist function", () => {
  it("returns null if no artist is found", async () => {
    const { getArtist } = artistController(defaultParams);
    const result = await getArtist(1);
    expect(result).toBe(null);
  });

  it("returns the artist if found", async () => {
    const artists = getFakeArtists({ length: 2 });
    await prisma.artist.createMany({ data: artists });
    const { getArtist, addRelatedArtist } = artistController(defaultParams);
    await addRelatedArtist(1, 2);
    const result = await getArtist(1);
    expect(result).toMatchObject(artists.at(0));
  });
});

describe("artist - getSelectedArtist function", () => {
  it("returns null if the selection is empty", async () => {
    const artists = getFakeArtists({ length: 2 });
    await prisma.artist.createMany({ data: artists });
    const { getSelectedArtist } = artistController(defaultParams);
    const result = await getSelectedArtist([]);
    expect(result).toBe(null);
  });

  it("returns the selected artist", async () => {
    const artists = getFakeArtists({ length: 2 });
    await prisma.artist.createMany({ data: artists });
    const { getSelectedArtist } = artistController(defaultParams);
    const result = await getSelectedArtist([1]);
    expect(result).toMatchObject(artists.at(0));
  });
});

describe("artist - getSelectedArtists function", () => {
  it("returns the selected artists", async () => {
    const artists = getFakeArtists({ length: 2 });
    await prisma.artist.createMany({ data: artists });
    const { getSelectedArtists } = artistController(defaultParams);
    const result = await getSelectedArtists([1, 2]);
    expect(result).toMatchObject(artists);
  });
});

describe("artist - getArtistAlphabeticalList function", () => {
  it("returns all the artists grouped by letter", async () => {
    const artists = getFakeArtists({ length: 5 });
    await prisma.artist.createMany({ data: artists });
    const { getArtistAlphabeticalList } = artistController(defaultParams);
    const result = await getArtistAlphabeticalList();
    expect(result).toMatchObject([
      [
        "a",
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        artists.map(({ createdAt, ...x }) => x),
      ],
    ]);
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

  it("returns the latest added artists with default pagination params", async () => {
    const artists = getFakeArtists({ length: 100 });
    await prisma.artist.createMany({ data: artists });
    const { getLatestArtists } = artistController(defaultParams);
    const result = await getLatestArtists();
    expect(result).toMatchObject({
      pagination: {
        take: 50,
        skip: 0,
        total: artists.length,
      },
      results: artists.toReversed().slice(0, 50),
    });
  });
});

describe("artist - editArtist function", () => {
  it("updates the artist with the given information", async () => {
    const artist = getFakeArtist();
    const releases = getFakeReleasesForArtist(1, 2);

    const send = vi.fn();

    const { editArtist } = artistController({
      ...defaultParams,
      send,
    });

    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });

    const result = await editArtist({
      ...artist,
      newName: "Artist New",
    });

    expect(result).toBeTruthy();

    expect(send).toHaveBeenCalledWith("notify", {
      message: "Artist renamed",
      type: "success",
    });
  });
});

describe("artist - setArtistCoverRelease function", () => {
  it("does nothing if no artist is found", async () => {
    const send = vi.fn();
    const { setArtistCoverRelease } = artistController({
      ...defaultParams,
      send,
    });

    await setArtistCoverRelease(1, 1);
    expect(send).not.toHaveBeenCalled();
  });

  it("sets the artist cover release", async () => {
    const artist = getFakeArtist();
    const release = getFakeReleasesForArtist(artist.id).at(0);
    await prisma.artist.create({ data: artist });
    await prisma.release.create({ data: release });

    const send = vi.fn();
    const { setArtistCoverRelease } = artistController({
      ...defaultParams,
      send,
    });

    await setArtistCoverRelease(artist.id, release.id);
    const updatedArtist = await prisma.artist.findFirst({
      where: { id: artist.id },
    });

    expect(updatedArtist.coverReleaseId).toBe(release.id);
    expect(send).toHaveBeenCalledWith("mutate", [
      ["artists", "latest"],
      ["artists", 1],
    ]);
  });
});

describe("artist - addRelatedArtist function", () => {
  it("adds a related artist", async () => {
    const artists = getFakeArtists({ length: 2 });
    await prisma.artist.createMany({ data: artists });

    const send = vi.fn();

    const { addRelatedArtist } = artistController({ ...defaultParams, send });

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

    expect(send).toHaveBeenCalledWith("mutate", [
      ["artists", 2],
      ["artists", 1],
    ]);
  });
});

describe("artist - addNewRelatedArtist function", () => {
  it("adds a new related artist", async () => {
    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });

    const send = vi.fn();

    const { addNewRelatedArtist } = artistController({
      ...defaultParams,
      send,
    });

    await addNewRelatedArtist({
      artist_id: 1,
      name: "New Related Artist",
    });

    const updatedArtist = await prisma.artist.findFirst({
      where: { id: 1 },
      include: { relatedArtists: true, symmetricRelatedArtists: true },
    });

    const createdArtist = await prisma.artist.findFirst({
      where: { name: "New Related Artist" },
      include: { relatedArtists: true, symmetricRelatedArtists: true },
    });

    expect(updatedArtist.relatedArtists).toMatchObject([{ id: 2 }]);
    expect(createdArtist.relatedArtists).toMatchObject([{ id: 1 }]);

    expect(send).toHaveBeenCalledWith("mutate", [["artists", 1]]);
  });
});

describe("artist - removeRelatedArtist function", () => {
  it("removes a related artist", async () => {
    const artists = getFakeArtists({ length: 3 });
    await prisma.artist.createMany({ data: artists });

    const send = vi.fn();

    const { addRelatedArtist, removeRelatedArtist } = artistController({
      ...defaultParams,
      send,
    });

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

    expect(send).toHaveBeenCalledWith("mutate", [
      ["artists", 2],
      ["artists", 1],
    ]);
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

describe("artist - deleteArtist function", () => {
  it("does nothing if the cancel button is pressed", async () => {
    await prisma.artist.create({ data: getFakeArtist(1) });
    const send = vi.fn();
    const stateManager = {
      setSelection: vi.fn(),
    } as unknown as StateManager;
    const { deleteArtist } = artistController({
      ...defaultParams,
      send,
      openConfirmDialog: () => false,
      stateManager,
    });

    await deleteArtist(1);

    const artist = await prisma.artist.findFirst({ where: { id: 1 } });

    expect(artist).not.toBeNull();
    expect(send).not.toHaveBeenCalled();
    expect(stateManager.setSelection).not.toHaveBeenCalled();
  });

  it("removes the selected artist", async () => {
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.createMany({ data: getFakeReleasesForArtist(1) });

    const send = vi.fn();
    const stateManager = {
      setSelection: vi.fn(),
    } as unknown as StateManager;
    const { deleteArtist } = artistController({
      ...defaultParams,
      send,
      openConfirmDialog: () => true,
      stateManager,
    });

    await deleteArtist(1);

    const artist = await prisma.artist.findFirst({ where: { id: 1 } });
    const releases = await prisma.release.findMany({ where: { artist_id: 1 } });

    expect(artist).toBeNull();
    expect(releases).toEqual([]);
    expect(send).toHaveBeenCalledWith("mutate", [
      ["releases", "latest"],
      ["artists", "latest"],
      ["artists", "search"],
      ["artists", 1],
    ]);
    expect(stateManager.setSelection).toHaveBeenCalled();
  });
});

describe("artist - deleteArtists function", () => {
  it("does nothing if the cancel button is pressed", async () => {
    await prisma.artist.createMany({ data: getFakeArtists({ length: 3 }) });
    const send = vi.fn();
    const stateManager = {
      setSelection: vi.fn(),
    } as unknown as StateManager;
    const { deleteArtists } = artistController({
      ...defaultParams,
      send,
      openConfirmDialog: () => false,
      stateManager,
    });

    await deleteArtists([1, 2]);

    await Promise.all(
      [1, 2, 3].map(async (id) => {
        expect(await prisma.artist.findFirst({ where: { id } })).not.toBeNull();
      })
    );

    expect(send).not.toHaveBeenCalled();
    expect(stateManager.setSelection).not.toHaveBeenCalled();
  });

  it("removes the selected artists", async () => {
    await prisma.artist.createMany({ data: getFakeArtists({ length: 3 }) });
    await prisma.release.createMany({
      data: [1, 2, 3].flatMap((id) => getFakeReleasesForArtist(id)),
    });

    const send = vi.fn();
    const stateManager = {
      setSelection: vi.fn(),
    } as unknown as StateManager;
    const { deleteArtists } = artistController({
      ...defaultParams,
      send,
      openConfirmDialog: () => true,
      stateManager,
    });

    await deleteArtists([1, 2]);

    await Promise.all(
      [1, 2].map(async (id) => {
        const artist = await prisma.artist.findFirst({ where: { id } });
        const releases = await prisma.release.findMany({
          where: { artist_id: id },
        });

        expect(artist).toBeNull();
        expect(releases).toEqual([]);
      })
    );

    const artist = await prisma.artist.findFirst({ where: { id: 3 } });
    const releases = await prisma.release.findMany({
      where: { artist_id: 3 },
    });

    expect(artist).not.toBeNull();
    expect(releases.length).not.toBe(0);

    expect(send).toHaveBeenCalledWith("mutate", [
      ["releases", "latest"],
      ["artists", "latest"],
      ["artists", "search"],
      ["artists", 1],
      ["artists", 2],
    ]);

    expect(stateManager.setSelection).toHaveBeenCalled();
  });
});

describe("artist - checkArtistFolderContents function", () => {
  it("returns false if Artist has no releases", async () => {
    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });

    const { checkArtistFolderContents } = artistController(defaultParams);
    expect(await checkArtistFolderContents(1)).toBe(false);
  });

  it("returns false if any release is still in place", async (context) => {
    const directory = await testFs(
      {
        "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1-1": {},
      },
      context.task.id
    );

    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: getFakeReleasesForArtist(1) });

    const { checkArtistFolderContents } = artistController({
      ...defaultParams,
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
    });

    expect(await checkArtistFolderContents(1)).toBe(false);
  });

  it("returns the longest common path if all the Artist releases have been moved", async (context) => {
    const directory = await testFs({}, context.task.id);

    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: getFakeReleasesForArtist(1) });

    const { checkArtistFolderContents } = artistController({
      ...defaultParams,
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
    });

    expect(await checkArtistFolderContents(1)).toBe("A/Artist 1/[Album]");
  });
});

describe("artist - relocateArtistFolder function", () => {
  it("shows an error box if the folders mismatch", async (context) => {
    const directory = await testFs(
      {
        "LIBRARY_PATH/New Folder": {},
      },
      context.task.id
    );

    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.createMany({ data: getFakeReleasesForArtist(1) });

    const send = vi.fn();
    const showErrorBox = vi.fn();

    const { relocateArtistFolder } = artistController({
      ...defaultParams,
      send,
      showErrorBox,
      stateManager: {
        getSelection: () => [1],
      } as unknown as StateManager,
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
      openFolderDialog: () => [path.join(directory, "LIBRARY_PATH/New Folder")],
    });

    const commonMissingPath = path.join(
      directory,
      "LIBRARY_PATH/A/Artist 1/[Album]"
    );

    await relocateArtistFolder(1, { commonMissingPath });

    expect(send).not.toHaveBeenCalled();

    expect(showErrorBox).toHaveBeenCalledWith(
      "Error relocating Artist folder",
      "The selected folder contents do not match the missing Releases."
    );
  });

  it("updates the releases with the new path if the content matches", async (context) => {
    const directory = await testFs(
      {
        "LIBRARY_PATH/A/Artist 1/New Folder": {
          "2000 - Release 1-1": {
            "01 - Track 01.mp3": "",
            "02 - Track 02.mp3": "",
            "03 - Track 03.mp3": "",
            "04 - Track 04.mp3": "",
            "05 - Track 05.mp3": "",
          },
          "2000 - Release 1-2": {
            "01 - Track 01.mp3": "",
            "02 - Track 02.mp3": "",
            "03 - Track 03.mp3": "",
            "04 - Track 04.mp3": "",
            "05 - Track 05.mp3": "",
          },
        },
      },
      context.task.id
    );

    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.createMany({ data: getFakeReleasesForArtist(1, 2) });

    const send = vi.fn();
    const showErrorBox = vi.fn();

    const { relocateArtistFolder } = artistController({
      ...defaultParams,
      send,
      showErrorBox,
      stateManager: {
        getSelection: () => [1],
      } as unknown as StateManager,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? path.join(directory, "LIBRARY_PATH") : key,
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
      openFolderDialog: () => [
        path.join(directory, "LIBRARY_PATH/A/Artist 1/New Folder"),
      ],
    });

    const commonMissingPath = "A/Artist 1/[Album]";

    await relocateArtistFolder(1, {
      commonMissingPath,
    });

    const updatedArtist = await prisma.artist.findFirst({
      where: { id: 1 },
      include: { releases: true },
    });

    expect(updatedArtist).toMatchObject({
      releases: [
        {
          path: "A/Artist 1/New Folder/2000 - Release 1-1",
        },
        {
          path: "A/Artist 1/New Folder/2000 - Release 1-2",
        },
      ],
    });

    expect(showErrorBox).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith("mutate", [
      ["artists", 1],
      ["releases", 1],
      ["releases", 2],
    ]);
    expect(send).toHaveBeenCalledWith("notify", {
      type: "success",
      message: "Artist folder relocated",
    });
  });
});
