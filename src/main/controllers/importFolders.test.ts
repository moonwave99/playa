import prisma from "../db/prisma";
import { clearPrisma } from "@/test/prisma-utils";
import { withPath, getSetting, send } from "@/test/utils";
import path from "path";
import { importFoldersController } from "./importFolders";
import { testFs } from "@moonwave99/test-fs";
import { Release, ReleaseWithArtistAndTracks, Track } from "@/types/types";
import { StateManager } from "../state";
import { getFakeArtist, getFakeReleasesForArtist } from "../../test/seed";

afterEach(clearPrisma);

vi.mock("../covers");

const defaultParams = {
  withPath,
  getSetting,
  send,
  state: {} as StateManager,
  openFolderDialog: vi.fn(),
};

describe("importFolder function", () => {
  it("returns null if the folder has no tracks", async () => {
    const { importFolder } = importFoldersController(defaultParams);

    const onProgress = vi.fn();

    const releases = await importFolder("empty/folder", onProgress);

    expect(releases).toEqual([]);
    expect(onProgress).not.toHaveBeenCalled();
  });

  it("returns null if the folder is malformed", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH/malformed/folder": {
          "01 - Track 1.mp3": "",
          "02 - Track 2.mp3": "",
          "03 - Track 3.mp3": "",
          "04 - Track 4.mp3": "",
          "05 - Track 5.mp3": "",
        },
      },
      context.task.id
    );

    const LIBRARY_PATH = path.join(directory, "LIBRARY_PATH");

    const { importFolder } = importFoldersController({
      ...defaultParams,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? LIBRARY_PATH : key,
    });

    const onProgress = vi.fn();

    const releases = await importFolder(
      path.join(LIBRARY_PATH, "malformed/folder"),
      onProgress
    );

    expect(releases).toEqual([]);
    expect(onProgress).not.toHaveBeenCalled();
  });

  it("parses the given path, updates the db and returns the created release", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH/A/Artist 1": {
          "[Album]": {
            "2000 - Release 1": {
              "01 - Track 1.mp3": "",
              "02 - Track 2.mp3": "",
              "03 - Track 3.mp3": "",
              "04 - Track 4.mp3": "",
              "05 - Track 5.mp3": "",
            },
          },
        },
      },
      context.task.id
    );

    const LIBRARY_PATH = path.join(directory, "LIBRARY_PATH");

    const { importFolder } = importFoldersController({
      ...defaultParams,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? LIBRARY_PATH : key,
    });

    const onProgress = vi.fn();

    const releases = await importFolder(
      path.join(LIBRARY_PATH, "A/Artist 1/[Album]"),
      onProgress
    );

    expect(releases.length).toBe(1);
    expect(releases[0].tracks.length).toBe(5);

    expect(onProgress).toHaveBeenCalledWith(
      path.join(LIBRARY_PATH, "A/Artist 1/[Album]/2000 - Release 1")
    );
    expect(onProgress).toHaveBeenCalledWith(
      path.join(LIBRARY_PATH, "A/Artist 1/[Album]/2000 - Release 1"),
      true
    );
    expect(onProgress).toHaveBeenCalledWith("done");
  });

  it("parses the given path, updates the db and returns the created releases", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH/A/Artist 1": {
          "[Album]": {
            "2000 - Release 1": {
              "01 - Track 1.mp3": "",
              "02 - Track 2.mp3": "",
              "03 - Track 3.mp3": "",
              "04 - Track 4.mp3": "",
              "05 - Track 5.mp3": "",
            },
            "2000 - Release 2": {
              "01 - Track 1.mp3": "",
              "02 - Track 2.mp3": "",
              "03 - Track 3.mp3": "",
              "04 - Track 4.mp3": "",
              "05 - Track 5.mp3": "",
            },
          },
        },
      },
      context.task.id
    );

    const LIBRARY_PATH = path.join(directory, "LIBRARY_PATH");

    const { importFolder } = importFoldersController({
      ...defaultParams,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? LIBRARY_PATH : key,
    });

    const onProgress = vi.fn();

    const importedReleases = await importFolder(
      path.join(LIBRARY_PATH, "A/Artist 1/[Album]"),
      onProgress
    );

    expect(importedReleases.length).toBe(2);
    expect(
      importedReleases.sort((a, b) => (a.title > b.title ? 1 : -1))
    ).toMatchObject([
      {
        entityType: "Release",
        path: "Release 1",
        title: "Release 1",
        hash: "ee1478c38c24f36e",
        year: 2000,
        type: "Album",
        artist_id: 1,
      },
      {
        entityType: "Release",
        path: "Release 2",
        title: "Release 2",
        hash: "4af3d5d9da84e183",
        year: 2000,
        type: "Album",
        artist_id: 1,
      },
    ]);
    expect(importedReleases[0].tracks.length).toBe(5);
    expect(importedReleases[1].tracks.length).toBe(5);

    expect(onProgress).toHaveBeenCalledWith("done");
  });
});

describe("refreshReleaseContents function", () => {
  it("does nothing is no release if found", async () => {
    const send = vi.fn();
    const { refreshReleaseContents } = importFoldersController({
      ...defaultParams,
      send,
    });
    const result = await refreshReleaseContents(1);
    expect(result).toBeFalsy();
    expect(send).not.toHaveBeenCalled();
  });

  it("updates the track information for the given release and returns it", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH/A/Artist 1": {
          "[Album]": {
            "2000 - Release 1": {
              "01 - Track 1.mp3": "",
              "02 - Track 2.mp3": "",
              "03 - Track 3.mp3": "",
              "04 - Track 4.mp3": "",
              "05 - Track 5.mp3": "",
            },
          },
        },
      },
      context.task.id
    );

    const LIBRARY_PATH = path.join(directory, "LIBRARY_PATH");

    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const send = vi.fn();

    const { refreshReleaseContents } = importFoldersController({
      ...defaultParams,
      send,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? LIBRARY_PATH : key,
    });
    const result = (await refreshReleaseContents(
      1
    )) as ReleaseWithArtistAndTracks[];

    expect(result[0]).toMatchObject(release);
    expect(result[0].tracks.length).toBe(5);

    expect(send).toHaveBeenCalledWith("mutate", [["releases", 1]]);
    expect(send).toHaveBeenCalledWith("notify", {
      type: "success",
      message: `${release.title} contents refreshed`,
    });
  });
});

describe("refreshCurrentArtistReleases function", () => {
  it("does nothing is no release should be refreshed", async () => {
    const send = vi.fn();
    const setImporting = vi.fn();
    const { refreshCurrentArtistReleases } = importFoldersController({
      ...defaultParams,
      send,
      state: {
        setImporting,
        getCurrentArtist: () => ({
          releases: [] as Release[],
        }),
      } as unknown as StateManager,
    });

    await refreshCurrentArtistReleases();

    expect(send).not.toHaveBeenCalled();
    expect(setImporting).not.toHaveBeenCalled();
  });

  it("updates the track information for releases of the current selected artist", async () => {
    const artist = getFakeArtist(1);
    const release = getFakeReleasesForArtist(artist.id).at(0);
    await prisma.artist.create({ data: artist });
    await prisma.release.create({ data: release });

    const send = vi.fn();
    const { refreshCurrentArtistReleases } = importFoldersController({
      ...defaultParams,
      send,
      state: {
        setImporting: vi.fn(),
        getCurrentArtist: () => ({
          ...artist,
          releases: [{ ...release, tracks: [] as Track[] }],
        }),
      } as unknown as StateManager,
    });
    await refreshCurrentArtistReleases();
    expect(send).toHaveBeenCalledWith("mutate", ["artists", 1]);
  });
});

describe("refreshEntityRelease function", () => {
  it("updates the track information for releases of the passed entity", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const send = vi.fn();
    const { refreshEntityRelease } = importFoldersController({
      ...defaultParams,
      send,
    });
    const artist = await prisma.artist.findFirst({ where: { id: 1 } });
    await refreshEntityRelease({
      ...artist,
      entityType: "Artist",
      releases: [],
    });
    expect(send).toHaveBeenCalledWith("mutate", ["artists", 1]);
  });
});

describe("importFolderFromDialog function", () => {
  it("does nothing if no folder is picked", async () => {
    const send = vi.fn();
    const { importFolderFromDialog } = importFoldersController({
      ...defaultParams,
      openFolderDialog: vi.fn(),
      send,
      state: {
        getCurrentArtist: () => null,
      } as StateManager,
    });

    await importFolderFromDialog();
    expect(send).not.toHaveBeenCalled();
  });

  it("imports the contents of the folder picked in the dialog", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH/A/Artist 1": {
          "[Album]": {
            "2000 - Release 1": {
              "01 - Track 1.mp3": "",
              "02 - Track 2.mp3": "",
              "03 - Track 3.mp3": "",
              "04 - Track 4.mp3": "",
              "05 - Track 5.mp3": "",
            },
          },
        },
      },
      context.task.id
    );

    const artist = getFakeArtist(1);
    const send = vi.fn();
    const { importFolderFromDialog } = importFoldersController({
      ...defaultParams,
      openFolderDialog: (folder: string) => [path.join(directory, folder)],
      send,
      state: {
        getCurrentArtist: () => artist,
      } as StateManager,
    });

    await importFolderFromDialog();
    expect(send).toHaveBeenCalledWith("mutate", [
      ["releases", "latest"],
      ["artists", 1],
    ]);
    expect(send).toHaveBeenCalledWith("notify", {
      type: "success",
      message: `1 releases imported`,
    });
  });
});
