import prisma from "../db/prisma";
import { clearPrisma } from "@/test/prisma-utils";
import { withPath, getSetting } from "@/test/utils";
import path from "path";
import { importFoldersController } from "./importFolders";
import { testFs } from "@moonwave99/test-fs";
import {
  ArtistWithReleasesFull,
  ReleaseWithArtistAndTracks,
} from "@/types/types";
import { StateManager } from "../stateManager";
import {
  getFakeArtist,
  getFakeReleasesForArtist,
  getFakeTracksForRelease,
} from "../../test/seed";
import { ICommonTagsResult } from "music-metadata/lib/type";

afterEach(clearPrisma);

vi.mock("../covers");

const defaultParams = {
  withPath,
  getSetting,
  send: vi.fn(),
  stateManager: {
    getSelection: (_: string) => {
      void _;
      return [] as number[];
    },
    setImporting: (_: boolean) => {
      void _;
    },
  } as StateManager,
  openFolderDialog: vi.fn(),
  showErrorBox: vi.fn(),
  openModal: vi.fn(),
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
        path: "Release 1",
        title: "Release 1",
        hash: "ee1478c38c24f36e",
        year: 2000,
        type: "Album",
        artist_id: 1,
      },
      {
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

describe("refreshArtistReleases function", () => {
  it("does nothing is no release should be refreshed", async () => {
    const send = vi.fn();
    const setImporting = vi.fn();
    const { refreshArtistReleases } = importFoldersController({
      ...defaultParams,
      send,
    });

    await refreshArtistReleases({
      releases: [],
    } as ArtistWithReleasesFull);

    expect(send).not.toHaveBeenCalled();
    expect(setImporting).not.toHaveBeenCalled();
  });

  it("updates the track information for releases of the current selected artist", async () => {
    const artist = getFakeArtist(1);
    const release = getFakeReleasesForArtist(artist.id).at(0);
    await prisma.artist.create({ data: artist });
    await prisma.release.create({ data: release });

    const send = vi.fn();
    const { refreshArtistReleases } = importFoldersController({
      ...defaultParams,
      send,
    });
    await refreshArtistReleases({
      id: 1,
      releases: [{ id: 1, tracks: [] }],
    } as ArtistWithReleasesFull);
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
      stateManager: {
        getSelection: () => [] as number[],
      } as unknown as StateManager,
    });

    await importFolderFromDialog();
    expect(send).not.toHaveBeenCalled();
  });

  it("shows an error box if too many folders are selected", async () => {
    const showErrorBox = vi.fn();
    const send = vi.fn();

    const { importFolderFromDialog } = importFoldersController({
      ...defaultParams,
      openFolderDialog: () =>
        Array.from({ length: 20 }, (_, i) => `folder-${i}`),
      stateManager: {
        getSelection: () => [] as number[],
      } as unknown as StateManager,
      showErrorBox,
      send,
    });

    await importFolderFromDialog();

    expect(showErrorBox).toHaveBeenCalledWith(
      "Error importing folders",
      "You can import at max 10 folders at once"
    );

    expect(send).not.toHaveBeenCalled();
  });

  it("shows an error box if the selected folder is outside the library path", async (context) => {
    const directory = await testFs({}, context.task.id);
    const LIBRARY_PATH = path.join(directory, "LIBRARY_PATH");

    const showErrorBox = vi.fn();
    const send = vi.fn();

    const { importFolderFromDialog } = importFoldersController({
      ...defaultParams,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? LIBRARY_PATH : key,
      openFolderDialog: () => ["/some/other/folder"],
      showErrorBox,
      send,
      stateManager: {
        getSelection: () => [] as number[],
      } as unknown as StateManager,
    });

    await importFolderFromDialog();

    expect(showErrorBox).toHaveBeenCalledWith(
      "Error importing folders",
      "The folders should be contained in your Library."
    );

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
    const LIBRARY_PATH = path.join(directory, "LIBRARY_PATH");

    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });
    const send = vi.fn();
    const openModal = vi.fn();

    const { importFolderFromDialog } = importFoldersController({
      ...defaultParams,
      openFolderDialog: ({ defaultPath }) => [
        path.join(directory, defaultPath),
      ],
      send,
      openModal,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? LIBRARY_PATH : key,
      stateManager: {
        getSelection: () => [1],
      } as unknown as StateManager,
    });

    await importFolderFromDialog();
    expect(send).toHaveBeenCalledWith("mutate", [
      ["artists", "latest"],
      ["releases", "latest"],
      ["artists", 1],
    ]);
    expect(send).toHaveBeenCalledWith("notify", {
      type: "success",
      message: `1 releases imported`,
    });
  });

  describe("USE_SMART_IMPORT: FALSE", () => {
    it("opens the interactive import dialog", async (context) => {
      const directory = await testFs(
        {
          "/LIBRARY_PATH/A/Artist 1": {
            "[Album]": {
              "2000 - Release 1": {
                "01 - Track 1.mp3": "",
                "02 - Track 2.mp3": "",
              },
            },
          },
        },
        context.task.id
      );
      const LIBRARY_PATH = path.join(directory, "LIBRARY_PATH");
      const artist = getFakeArtist(1);
      await prisma.artist.create({ data: artist });

      const showErrorBox = vi.fn();
      const send = vi.fn();
      const openModal = vi.fn();

      const { importFolderFromDialog } = importFoldersController({
        ...defaultParams,
        getSetting: (key: string) =>
          key === "LIBRARY_PATH" ? LIBRARY_PATH : false,
        openFolderDialog: ({ defaultPath }) => [
          path.join(directory, defaultPath, "[Album]", "2000 - Release 1"),
        ],
        showErrorBox,
        send,
        openModal,
        stateManager: {
          getSelection: () => [1],
        } as unknown as StateManager,
      });

      await importFolderFromDialog();

      expect(openModal).toHaveBeenCalledWith("interactiveImport", {
        data: [
          {
            artist: {
              ...artist,
              coverReleaseId: null,
              updatedAt: null,
            },
            path: "2000 - Release 1",
            completePath: path.join(artist.path, "[Album]", "2000 - Release 1"),
            title: "Release 1",
            normalizedTitle: "Release 1",
            year: 2000,
            type: "Album",
            tracks: [
              {
                duration: 123,
                meta: {
                  album: "Release 1",
                  artist: "Artist 1",
                  title: "Track 1",
                  year: 2000,
                  track: {
                    no: 1,
                  },
                },
                path: "01 - Track 1.mp3",
                position: 1,
                title: "Track 1",
                trackArtist: "Artist 1",
              },
              {
                duration: 123,
                meta: {
                  album: "Release 1",
                  artist: "Artist 1",
                  title: "Track 2",
                  year: 2000,
                  track: {
                    no: 2,
                  },
                },
                path: "02 - Track 2.mp3",
                position: 2,
                title: "Track 2",
                trackArtist: "Artist 1",
              },
            ],
          },
        ],
      });
    });

    it("shows an error box if all selected folders are empty", async (context) => {
      const directory = await testFs(
        {
          "/LIBRARY_PATH/A/Artist 1": {
            "[Album]": {
              "2000 - Release 1": {},
              "2000 - Release 2": {},
            },
          },
        },
        context.task.id
      );
      const LIBRARY_PATH = path.join(directory, "LIBRARY_PATH");
      const artist = getFakeArtist(1);
      await prisma.artist.create({ data: artist });

      const showErrorBox = vi.fn();
      const send = vi.fn();

      const { importFolderFromDialog } = importFoldersController({
        ...defaultParams,
        getSetting: (key: string) =>
          key === "LIBRARY_PATH" ? LIBRARY_PATH : false,
        openFolderDialog: ({ defaultPath }) => [
          path.join(directory, defaultPath, "[Album]", "2000 - Release 1"),
          path.join(directory, defaultPath, "[Album]", "2000 - Release 2"),
        ],
        showErrorBox,
        send,
        stateManager: {
          getSelection: () => [1],
        } as unknown as StateManager,
      });

      await importFolderFromDialog();

      expect(showErrorBox).toHaveBeenCalledWith(
        "Error importing Folders",
        "All selected folders are empty."
      );
      expect(send).not.toHaveBeenCalled();
    });

    it("shows an error box when importing a single, already imported folder", async (context) => {
      const directory = await testFs(
        {
          "/LIBRARY_PATH/A/Artist 1": {
            "[Album]": {
              "2000 - Release 1": {
                "01 - Track 1.mp3": "",
                "02 - Track 2.mp3": "",
              },
            },
          },
        },
        context.task.id
      );
      const LIBRARY_PATH = path.join(directory, "LIBRARY_PATH");

      await prisma.artist.create({ data: getFakeArtist(1) });
      await prisma.release.create({
        data: {
          ...getFakeReleasesForArtist(1).at(0),
          path: "2000 - Release 1",
          completePath: "A/Artist 1/[Album]/2000 - Release 1",
        },
      });

      const showErrorBox = vi.fn();
      const send = vi.fn();

      const { importFolderFromDialog } = importFoldersController({
        ...defaultParams,
        getSetting: (key: string) =>
          key === "LIBRARY_PATH" ? LIBRARY_PATH : false,
        openFolderDialog: ({ defaultPath }) => [
          path.join(directory, defaultPath, "[Album]", "2000 - Release 1"),
        ],
        showErrorBox,
        send,
        stateManager: {
          getSelection: () => [1],
        } as unknown as StateManager,
      });

      await importFolderFromDialog();

      expect(showErrorBox).toHaveBeenCalledWith(
        "Error importing Folders",
        "Folder already imported"
      );
      expect(send).not.toHaveBeenCalled();
    });
  });
});

describe("importFromInteractiveData function", () => {
  it("creates a new release from the passed data", async () => {
    const showErrorBox = vi.fn();
    const send = vi.fn();

    const { importFromInteractiveData } = importFoldersController({
      ...defaultParams,
      showErrorBox,
      send,
    });

    const artist = getFakeArtist();
    const tracks = getFakeTracksForRelease(1, 2).map((x) => ({
      ...x,
      meta: {} as ICommonTagsResult,
    }));

    await importFromInteractiveData({
      artist,
      title: "New Release",
      year: 2000,
      type: "Album",
      path: "New Release",
      completePath: "LIBRARY_PATH/New Release",
      tracks,
    });

    const release = await prisma.release.findFirst({
      where: { id: 1 },
      include: { tracks: true },
    });

    expect(send).toHaveBeenCalledWith("mutate", [
      ["releases", "latest"],
      ["artists", 1],
    ]);

    expect(send).toHaveBeenCalledWith("notify", {
      type: "success",
      message: "New Release imported",
    });

    expect(release).toMatchObject({
      title: "New Release",
      normalizedTitle: "New Release",
      year: 2000,
      hash: "6ecba3dc88bfe067",
      type: "Album",
      path: "New Release",
      completePath: "LIBRARY_PATH/New Release",
      tracks: [
        {
          id: 1,
          title: "Track 1",
          normalizedTitle: "Track 1",
          trackArtist: "Track Artist",
          hash: "f4cbf14d6983211f",
          path: "01 - Track 1.mp3",
          duration: 180,
          releaseId: 1,
          position: 1,
        },
        {
          id: 2,
          title: "Track 2",
          normalizedTitle: "Track 2",
          trackArtist: "Track Artist",
          hash: "c5e4fb5e136df33c",
          path: "02 - Track 2.mp3",
          duration: 180,
          releaseId: 1,
          position: 2,
        },
      ],
    });
  });

  it("creates a new artist from the name if no artist id is passed", async () => {
    const showErrorBox = vi.fn();
    const send = vi.fn();

    const { importFromInteractiveData } = importFoldersController({
      ...defaultParams,
      showErrorBox,
      send,
    });

    const tracks = getFakeTracksForRelease(1, 2).map((x) => ({
      ...x,
      meta: {} as ICommonTagsResult,
    }));

    await importFromInteractiveData({
      artist: {
        id: null as number,
        name: "New Artist",
      },
      title: "New Release",
      year: 2000,
      type: "Album",
      path: "New Release",
      completePath: "LIBRARY_PATH/New Release",
      tracks,
    });

    const release = await prisma.release.findFirst({
      where: { id: 1 },
      include: { artist: true, tracks: true },
    });

    expect(send).toHaveBeenCalledWith("mutate", [
      ["releases", "latest"],
      ["artists", 1],
    ]);

    expect(send).toHaveBeenCalledWith("notify", {
      type: "success",
      message: "New Release imported",
    });

    expect(release).toMatchObject({
      artist: {
        id: 1,
        name: "New Artist",
      },
      title: "New Release",
      normalizedTitle: "New Release",
      year: 2000,
      hash: "6ecba3dc88bfe067",
      type: "Album",
      path: "New Release",
      completePath: "LIBRARY_PATH/New Release",
      tracks: [
        {
          id: 1,
          title: "Track 1",
          normalizedTitle: "Track 1",
          trackArtist: "Track Artist",
          hash: "f4cbf14d6983211f",
          path: "01 - Track 1.mp3",
          duration: 180,
          releaseId: 1,
          position: 1,
        },
        {
          id: 2,
          title: "Track 2",
          normalizedTitle: "Track 2",
          trackArtist: "Track Artist",
          hash: "c5e4fb5e136df33c",
          path: "02 - Track 2.mp3",
          duration: 180,
          releaseId: 1,
          position: 2,
        },
      ],
    });
  });
});
