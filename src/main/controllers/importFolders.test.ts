import prisma from "../db/prisma";
import { clearPrisma } from "@/test/prisma-utils";
import { getSetting } from "@/test/utils";
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
import { VARIOUS_ARTISTS_NAME } from "@/constants";
import { hashArtistName } from "../hash";

afterEach(clearPrisma);

vi.mock("../covers");

const defaultParams = {
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
      entityType: "artist",
      releases: [],
    });
    expect(send).toHaveBeenCalledWith("mutate", ["artists", 1]);
  });
});

describe("openImportDialog function", () => {
  it("shows an error box is no Library path is set", async () => {
    const send = vi.fn();
    const showErrorBox = vi.fn();
    const { openImportDialog } = importFoldersController({
      ...defaultParams,
      showErrorBox,
      openFolderDialog: vi.fn(),
      send,
      getSetting: () => "",
      stateManager: {
        getSelection: () => [] as number[],
      } as unknown as StateManager,
    });

    await openImportDialog();
    expect(send).not.toHaveBeenCalled();
    expect(showErrorBox).toHaveBeenCalledWith(
      "Error importing folders",
      "You have to set your Library path in the Settings"
    );
  });

  it("does nothing if no folder is picked", async () => {
    const send = vi.fn();
    const { openImportDialog } = importFoldersController({
      ...defaultParams,
      openFolderDialog: vi.fn(),
      send,
      stateManager: {
        getSelection: () => [] as number[],
      } as unknown as StateManager,
    });

    await openImportDialog();
    expect(send).not.toHaveBeenCalled();
  });

  it("shows an error box if too many folders are selected", async () => {
    const showErrorBox = vi.fn();
    const send = vi.fn();

    const { openImportDialog } = importFoldersController({
      ...defaultParams,
      openFolderDialog: () =>
        Array.from({ length: 20 }, (_, i) => `folder-${i}`),
      stateManager: {
        getSelection: () => [] as number[],
      } as unknown as StateManager,
      showErrorBox,
      send,
    });

    await openImportDialog();

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

    const { openImportDialog } = importFoldersController({
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

    await openImportDialog();

    expect(showErrorBox).toHaveBeenCalledWith(
      "Error importing folders",
      "The folders should be contained in your Library."
    );

    expect(send).not.toHaveBeenCalled();
  });

  it("opens the import folders dialog", async (context) => {
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

    const { openImportDialog } = importFoldersController({
      ...defaultParams,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? LIBRARY_PATH : false,
      openFolderDialog: ({ defaultPath }) => [
        path.join(defaultPath, "A/Artist 1", "[Album]", "2000 - Release 1"),
      ],
      showErrorBox,
      send,
      openModal,
      stateManager: {
        getSelection: () => [1],
      } as unknown as StateManager,
    });

    await openImportDialog();

    expect(openModal).toHaveBeenCalledWith("importFolders", {
      data: [
        {
          artist: {
            id: 1,
            name: "Artist 1",
          },
          path: "A/Artist 1/[Album]/2000 - Release 1",
          absolutePath: path.join(
            LIBRARY_PATH,
            "A/Artist 1/[Album]/2000 - Release 1"
          ),
          folder: "2000 - Release 1",
          title: "Release 1",
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

    const { openImportDialog } = importFoldersController({
      ...defaultParams,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? LIBRARY_PATH : false,
      openFolderDialog: ({ defaultPath }) => [
        path.join(defaultPath, "A/Artist 1", "[Album]", "2000 - Release 1"),
        path.join(defaultPath, "A/Artist 1", "[Album]", "2000 - Release 2"),
      ],
      showErrorBox,
      send,
      stateManager: {
        getSelection: () => [1],
      } as unknown as StateManager,
    });

    await openImportDialog();

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
        path: "A/Artist 1/[Album]/2000 - Release 1",
      },
    });

    const showErrorBox = vi.fn();
    const send = vi.fn();

    const { openImportDialog } = importFoldersController({
      ...defaultParams,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? LIBRARY_PATH : false,
      openFolderDialog: ({ defaultPath }) => [
        path.join(defaultPath, "A/Artist 1", "[Album]", "2000 - Release 1"),
      ],
      showErrorBox,
      send,
      stateManager: {
        getSelection: () => [1],
      } as unknown as StateManager,
    });

    await openImportDialog();

    expect(showErrorBox).toHaveBeenCalledWith(
      "Error importing Folders",
      "Folder already imported"
    );
    expect(send).not.toHaveBeenCalled();
  });
});

describe("getTracksInfo function", () => {
  it("returns null if the folder contains no tracks", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH/A/Artist 1": {
          "[Album]": {
            "2000 - Release 1": {},
          },
        },
      },
      context.task.id
    );

    const LIBRARY_PATH = path.join(directory, "LIBRARY_PATH");

    const { getTracksInfo } = importFoldersController({
      ...defaultParams,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? LIBRARY_PATH : false,
    });

    expect(
      await getTracksInfo(
        path.join(LIBRARY_PATH, "A", "Artist 1", "[Album]", "2000 - Release 1")
      )
    ).toBe(null);
  });

  it("returns the info for the folder tracks", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH/A/Artist 1": {
          "[Album]": {
            "2000 - Release 1": {
              "01 - Track 1.mp3": "",
              "02 - Track 2.mp3": "",
              "03 - Track 3.mp3": "",
            },
          },
        },
      },
      context.task.id
    );

    const LIBRARY_PATH = path.join(directory, "LIBRARY_PATH");

    const { getTracksInfo } = importFoldersController({
      ...defaultParams,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? LIBRARY_PATH : false,
    });

    expect(
      await getTracksInfo(
        path.join(LIBRARY_PATH, "A", "Artist 1", "[Album]", "2000 - Release 1")
      )
    ).toMatchSnapshot();
  });

  it("returns the info for the tracks of a possible V/A folder (V/A artist already existing)", async (context) => {
    await prisma.artist.create({
      data: {
        name: VARIOUS_ARTISTS_NAME,
        hash: hashArtistName(VARIOUS_ARTISTS_NAME),
      },
    });
    const directory = await testFs(
      {
        "/LIBRARY_PATH/X/Various Artists/": {
          "[Album]": {
            "2000 - Release 1": {
              "01 - Track 1.mp3": "",
              "02 - Track 2.mp3": "",
              "03 - Track 3.mp3": "",
            },
          },
        },
      },
      context.task.id
    );

    const LIBRARY_PATH = path.join(directory, "LIBRARY_PATH");

    const { getTracksInfo } = importFoldersController({
      ...defaultParams,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? LIBRARY_PATH : false,
    });

    expect(
      await getTracksInfo(
        path.join(
          LIBRARY_PATH,
          "X",
          "Various Artists",
          "[Album]",
          "2000 - Release 1"
        )
      )
    ).toMatchSnapshot();
  });

  it("returns the info for the tracks of a possible V/A folder (V/A artist not existing)", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH/X/Various Artists/": {
          "[Album]": {
            "2000 - Release 1": {
              "01 - Track 1.mp3": "",
              "02 - Track 2.mp3": "",
              "03 - Track 3.mp3": "",
            },
          },
        },
      },
      context.task.id
    );

    const LIBRARY_PATH = path.join(directory, "LIBRARY_PATH");

    const { getTracksInfo } = importFoldersController({
      ...defaultParams,
      getSetting: (key: string) =>
        key === "LIBRARY_PATH" ? LIBRARY_PATH : false,
    });

    expect(
      await getTracksInfo(
        path.join(
          LIBRARY_PATH,
          "X",
          "Various Artists",
          "[Album]",
          "2000 - Release 1"
        )
      )
    ).toMatchSnapshot();
  });
});

describe("importFromData function", () => {
  it("creates a new release from the passed data", async () => {
    const showErrorBox = vi.fn();
    const send = vi.fn();

    const { importFromData } = importFoldersController({
      ...defaultParams,
      showErrorBox,
      send,
    });

    const artist = getFakeArtist();
    const tracks = getFakeTracksForRelease(1, 2).map((x) => ({
      ...x,
      meta: {} as ICommonTagsResult,
    }));

    await importFromData({
      artist,
      title: "New Release",
      year: 2000,
      type: "Album",
      path: "LIBRARY_PATH/New Release",
      tracks,
    });

    const release = await prisma.release.findFirst({
      where: { id: 1 },
      include: { tracks: true },
    });

    expect(send).toHaveBeenCalledWith("mutate", [
      ["releases", "latest"],
      ["artists", "latest"],
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
      path: "LIBRARY_PATH/New Release",
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

    const { importFromData } = importFoldersController({
      ...defaultParams,
      showErrorBox,
      send,
    });

    const tracks = getFakeTracksForRelease(1, 2).map((x) => ({
      ...x,
      meta: {} as ICommonTagsResult,
    }));

    await importFromData({
      artist: {
        id: null as number,
        name: "New Artist",
      },
      title: "New Release",
      year: 2000,
      type: "Album",
      path: "LIBRARY_PATH/New Release",
      tracks,
    });

    const release = await prisma.release.findFirst({
      where: { id: 1 },
      include: { artist: true, tracks: true },
    });

    expect(send).toHaveBeenCalledWith("mutate", [
      ["releases", "latest"],
      ["artists", "latest"],
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
      path: "LIBRARY_PATH/New Release",
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
