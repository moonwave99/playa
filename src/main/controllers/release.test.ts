import prisma from "../db/prisma";
import { clearPrisma } from "@/test/prisma-utils";
import { withPath, getSetting, send } from "@/test/utils";
import path from "path";
import fsExtra, { pathExists } from "fs-extra";
import { releaseController } from "./release";
import { testFs } from "@moonwave99/test-fs";
import {
  ReleaseType,
  ReleaseWithArtist,
  ReleaseWithArtistAndSubReleases,
} from "@/types/types";
import { StateManager } from "../stateManager";
import {
  getFakeArtist,
  getFakeArtists,
  getFakeReleasesForArtist,
} from "../../test/seed";
import { sortBy } from "@/lib/utils";

afterEach(clearPrisma);

vi.mock("../covers");

const defaultParams = {
  withPath,
  getSetting,
  send,
  stateManager: {} as StateManager,
  showErrorBox: vi.fn(),
  openConfirmDialog: vi.fn(),
};

describe("hideRelease function", () => {
  it("hides the release from the homepage", async () => {
    const releases = getFakeReleasesForArtist(1, 20);
    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });

    const send = vi.fn();
    const { getReleases, hideRelease } = releaseController({
      ...defaultParams,
      send,
    });
    await hideRelease(1);
    expect(send).toHaveBeenCalledWith("mutate", [["releases", "latest"]]);

    const results = await getReleases({ take: 20, skip: 0 });
    expect(results.results.find((x) => x.id === 1)).toBeFalsy();
  });
});

describe("showRelease function", () => {
  it("shows a previously hidden release on the homepage", async () => {
    const releases = getFakeReleasesForArtist(1, 20);
    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });

    const send = vi.fn();
    const { getReleases, hideRelease, showRelease } = releaseController({
      ...defaultParams,
      send,
    });

    {
      await hideRelease(1);
      expect(send).toHaveBeenCalledWith("mutate", [["releases", "latest"]]);
      const results = await getReleases({ take: 20, skip: 0 });
      expect(results.results.find((x) => x.id === 1)).toBeFalsy();
    }

    {
      await showRelease(1);
      expect(send).toHaveBeenCalledWith("mutate", [["releases", "latest"]]);
      const results = await getReleases({ take: 20, skip: 0 });
      expect(results.results.find((x) => x.id === 1)).toBeTruthy();
    }
  });
});

describe("getReleases function", () => {
  it("returns the releases with default pagination params", async () => {
    const releases = getFakeReleasesForArtist(1, 100);
    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });

    const { getReleases } = releaseController(defaultParams);
    const result = await getReleases();

    expect(result.pagination).toMatchObject({
      take: 50,
      skip: 0,
      total: releases.length,
    });

    expect(result.results).toMatchObject(
      releases.toSorted(sortBy("createdAt", "desc")).slice(0, 50)
    );
  });

  it("returns the releases with the given pagination params", async () => {
    const releases = getFakeReleasesForArtist(1, 20);
    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });

    const { getReleases } = releaseController(defaultParams);
    const result = await getReleases({ take: 10, skip: 0 });

    expect(result.pagination).toMatchObject({
      take: 10,
      skip: 0,
      total: releases.length,
    });

    expect(result.results).toMatchObject(
      releases.toSorted(sortBy("createdAt", "desc")).slice(0, 10)
    );
  });

  it("must exclude subreleases", async () => {
    const releases = getFakeReleasesForArtist(1);
    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });

    const { getReleases, groupReleases } = releaseController(defaultParams);

    await groupReleases({
      mainRelease: {
        id: 1,
        title: "main release title",
      },
      discInfo: [
        { id: 1, title: "disc 1", number: 1 },
        { id: 2, title: "disc 2", number: 2 },
      ],
    });

    const result = await getReleases({ take: 10, skip: 0 });

    expect(result.results).toMatchObject(
      releases
        .filter((x) => x.id !== 2)
        .toSorted(sortBy("createdAt", "desc"))
        .map((x) =>
          x.id === 1
            ? {
                ...x,
                title: "main release title",
                normalizedTitle: "main release title",
                discTitle: "disc 1",
              }
            : x
        )
    );
  });
});

describe("getLatestAdditions function", () => {
  it("returns the latest added releases grouped by date", async () => {
    const releases = getFakeReleasesForArtist(1, 20);
    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });

    const { getLatestAdditions } = releaseController(defaultParams);
    const result = await getLatestAdditions("2025-11-01");

    expect(result).toMatchObject({
      "2025-11-11": [
        { id: 11, createdAt: new Date("2025-11-11T21:41:31.693Z") },
      ],
      "2025-12-12": [
        { id: 12, createdAt: new Date("2025-12-12T21:41:31.693Z") },
      ],
    });
  });
});

describe("editRelease function", () => {
  it("shows a warning if the new path already exists", async () => {
    const { editRelease } = releaseController(defaultParams);
    const result = await editRelease([]);
    expect(result).toEqual([]);
  });

  it("just renames the discs if no other info is changed", async () => {
    const { editRelease } = releaseController(defaultParams);
    const spy = vi.spyOn(fsExtra, "move");
    const releases = getFakeReleasesForArtist(1, 2);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.createMany({ data: releases });

    const result = (await editRelease([
      {
        ...releases[0],
        newPath: "Release 1",
        newDiscTitle: "New Disc 1",
        newTitle: "Release 1",
        newYear: 2000,
        newType: "Album" as ReleaseType,
      },
      {
        ...releases[1],
        newPath: "Release 2",
        newDiscTitle: "New Disc 2",
        newTitle: "Release 2",
        newYear: 2000,
        newType: "Album" as ReleaseType,
      },
    ])) as ReleaseWithArtist[];

    expect(result).toMatchObject([
      { discTitle: "New Disc 1" },
      { discTitle: "New Disc 2" },
    ]);

    expect(spy).not.toHaveBeenCalled();
  });

  it("updates the release info without moving the folder if the passed path is the old one", async (context) => {
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

    const { editRelease } = releaseController({
      ...defaultParams,
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
      getSetting: (key: string) => (key === "USE_SMART_IMPORT" ? true : key),
    });
    const spy = vi.spyOn(fsExtra, "move");
    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const newInfo = {
      completePath: "A/Artist 1/[Album]/2000 - Release 1",
      newPath: "Release 1",
      newDiscTitle: "Album Edited",
      newTitle: "Album Edited",
      newYear: 2000,
      newType: "Album" as ReleaseType,
    };

    const result = (await editRelease([
      { ...release, ...newInfo },
    ])) as ReleaseWithArtist[];

    expect(result[0]).toMatchObject({
      completePath: "A/Artist 1/[Album]/2000 - Release 1",
      path: "Release 1",
      discTitle: null,
      title: "Album Edited",
      year: 2000,
      type: "Album" as ReleaseType,
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it("shows a warning if the new path contains any ../ sequence", async () => {
    const showErrorBox = vi.fn();
    const { editRelease } = releaseController({
      ...defaultParams,
      showErrorBox,
    });
    const moveSpy = vi.spyOn(fsExtra, "move");

    const newInfo = {
      newPath: "../Album One",
      newDiscTitle: "Album Edited",
      newTitle: "Album Edited",
      newType: "EP" as ReleaseType,
      newYear: 2000,
    };

    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const result = await editRelease([
      {
        ...release,
        ...newInfo,
      },
    ]);

    expect(showErrorBox).toHaveBeenCalledWith(
      "Error while renaming",
      "Path cannot contain any '../' sequence"
    );

    expect(result).toBe(false);
    expect(moveSpy).not.toHaveBeenCalled();
  });

  it("shows a warning if the new path exists", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH/A/Artist 1/[Album]/": {
          "2000 - Release 1": {},
          "2000 - New Album Path": {},
        },
      },
      context.task.id
    );

    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const showErrorBox = vi.fn();
    const { editRelease } = releaseController({
      ...defaultParams,
      showErrorBox,
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
    });

    const moveSpy = vi.spyOn(fsExtra, "move");

    const newInfo = {
      newPath: "New Album Path",
      newDiscTitle: "Album Edited",
      newTitle: "Album Edited",
      newType: "Album" as ReleaseType,
      newYear: 2000,
    };

    const result = await editRelease([
      {
        ...release,
        ...newInfo,
      },
    ]);

    expect(showErrorBox).toHaveBeenCalledWith(
      "Error while renaming",
      `Path ${newInfo.newPath} already exists`
    );

    expect(result).toBe(false);
    expect(moveSpy).not.toHaveBeenCalled();
  });

  it("shows a warning if the old path does not exist", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH": {},
      },
      context.task.id
    );

    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const showErrorBox = vi.fn();

    const { editRelease } = releaseController({
      ...defaultParams,
      showErrorBox,
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
    });

    const newInfo = {
      newPath: "New Album Path",
      newDiscTitle: "Album Edited",
      newTitle: "Album Edited",
      newType: "EP" as ReleaseType,
      newYear: 2000,
    };

    const result = await editRelease([
      {
        ...release,
        ...newInfo,
      },
    ]);

    expect(showErrorBox).toHaveBeenCalledWith(
      "Error while renaming",
      `Release 1 not found at: ${path.join(directory, "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1")}`
    );

    expect(result).toBe(false);
  });

  it("should move the release files and update it accordingly", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1": {
          "01 - Track 1.mp3": "",
        },
        "/LIBRARY_PATH/A/Artist 1/[EP]": {},
        "/COVERS_PATH": {
          "ee1478c38c24f36e-cover.jpg": "",
        },
      },
      context.task.id
    );

    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const { editRelease } = releaseController({
      ...defaultParams,
      getSetting: (key: string) => (key === "USE_SMART_IMPORT" ? true : key),
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
    });

    const newInfo = {
      completePath: "A/Artist 1/[Album]/2000 - Release 1",
      newPath: "New Release Path",
      newDiscTitle: "Release Edited",
      newTitle: "Release Edited",
      newType: "EP" as ReleaseType,
      newYear: 2001,
    };

    const result = (await editRelease([
      { ...release, ...newInfo },
    ])) as ReleaseWithArtist[];

    expect(result[0]).toMatchObject({
      path: "New Release Path",
      discTitle: null,
      title: "Release Edited",
      type: "EP" as ReleaseType,
      year: 2001,
    });

    expect(
      await pathExists(
        path.join(directory, "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1")
      )
    ).toBe(false);
    expect(
      await pathExists(
        path.join(
          directory,
          "LIBRARY_PATH/A/Artist 1/[EP]/2001 - New Release Path"
        )
      )
    ).toBe(true);
    expect(
      await pathExists(
        path.join(directory, "COVERS_PATH/ee1478c38c24f36e-cover.jpg")
      )
    ).toBe(false);
    expect(
      await pathExists(
        path.join(directory, "COVERS_PATH/fefd4689cea9a44d-cover.jpg")
      )
    ).toBe(true);
  });

  it("should skip moving the current cover if it does not exist", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1": {
          "01 - Track 1.mp3": "",
        },
        "/LIBRARY_PATH/A/Artist 1/[EP]": {},
      },
      context.task.id
    );

    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const { editRelease } = releaseController({
      ...defaultParams,
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
    });

    const newInfo = {
      newPath: "New Release Path",
      newDiscTitle: "Release Edited",
      newTitle: "Release Edited",
      newType: "EP" as ReleaseType,
      newYear: 2001,
    };

    const result = (await editRelease([
      { ...release, ...newInfo },
    ])) as ReleaseWithArtist[];

    expect(result[0]).toMatchObject({
      path: "New Release Path",
      discTitle: null,
      title: "Release Edited",
      type: "EP" as ReleaseType,
      year: 2001,
    });

    expect(
      await pathExists(
        path.join(directory, "COVERS_PATH/e1d0657d4ba3bd51-cover.jpg")
      )
    ).toBe(false);
  });
});

describe("importCovers function", () => {
  it("searches the covers of the given releases and returns those with positive results", async () => {
    {
      const release = getFakeReleasesForArtist(1).at(0);
      await prisma.artist.create({ data: getFakeArtist(1) });
      await prisma.release.create({ data: release });

      const send = vi.fn();
      const { importCovers } = releaseController({ ...defaultParams, send });
      await importCovers([release as ReleaseWithArtist]);
      expect(send).toHaveBeenCalledWith("coverUpdate", [release]);
    }
    {
      const release = getFakeReleasesForArtist(1, 3).at(2);
      await prisma.artist.create({ data: getFakeArtist(1) });
      await prisma.release.create({ data: release });

      const send = vi.fn();
      const { importCovers } = releaseController({ ...defaultParams, send });
      await importCovers([release as ReleaseWithArtist]);
      expect(send).not.toHaveBeenCalled();
    }
  });
});

describe("importMissingCovers function", () => {
  it("imports the covers of the releases without an existing cover file", async (context) => {
    const directory = await testFs(
      {
        "COVERS_PATH/ee1478c38c24f36e-cover.jpg": "",
      },
      context.task.id
    );
    const releases = getFakeReleasesForArtist(1, 2);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.createMany({ data: releases });

    const send = vi.fn();
    const { importMissingCovers } = releaseController({
      ...defaultParams,
      send,
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
    });
    {
      await importMissingCovers([releases[0]] as ReleaseWithArtist[]);
      expect(send).not.toHaveBeenCalled();
    }
    {
      await importMissingCovers(releases as ReleaseWithArtist[]);
      expect(send).toHaveBeenCalledWith("coverUpdate", [releases[1]]);
    }
  });
});

describe("deleteCover function", () => {
  it("deletes the coves of the given release", async (context) => {
    const directory = await testFs(
      {
        "COVERS_PATH/ee1478c38c24f36e-cover.jpg": "",
      },
      context.task.id
    );

    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const send = vi.fn();
    const { deleteCover } = releaseController({
      ...defaultParams,
      send,
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
    });

    await deleteCover(release);
    expect(send).toHaveBeenCalledWith("coverUpdate", [release]);
    expect(
      await pathExists(withPath("COVERS_PATH", "e6ff3253fb407e5f-cover.jpg"))
    ).toBe(false);
  });
});

describe("downloadCover function", () => {
  it("does nothing is no release if found", async () => {
    const { downloadCover } = releaseController(defaultParams);
    const result = await downloadCover({
      id: 1,
      url: "https://example.com/pic.jpg",
    });
    expect(result).toBeFalsy();
  });

  it("downloads the passed url and stores as the cover for the given release id", async (context) => {
    const directory = await testFs({ COVERS_PATH: {} }, context.task.id);
    const getSetting = (key: string) => {
      if (key === "LIBRARY_PATH" || key === "COVERS_PATH") {
        return path.join(directory, key);
      }
      return key;
    };
    {
      const send = vi.fn();
      const release = getFakeReleasesForArtist(1).at(0);
      await prisma.artist.create({ data: getFakeArtist(1) });
      await prisma.release.create({ data: release });

      const { downloadCover } = releaseController({
        ...defaultParams,
        send,
        getSetting,
        withPath: (key, folderPath) => path.join(directory, key, folderPath),
      });

      const result = await downloadCover({
        id: 1,
        url: "https://example.com/pic.jpg",
      });

      expect(result).toBeTruthy();
      expect(
        await pathExists(
          path.join(directory, `/COVERS_PATH/${release.hash}-cover.jpg`)
        )
      ).toBe(true);
      expect(send).toHaveBeenCalledWith("coverUpdate", expect.anything());
    }
    {
      const send = vi.fn();
      const release = getFakeReleasesForArtist(1, 2).at(1);
      await prisma.artist.create({ data: getFakeArtist(1) });
      await prisma.release.create({ data: release });

      const { downloadCover } = releaseController({
        ...defaultParams,
        withPath: (key, folderPath) => path.join(directory, key, folderPath),
      });
      const result = await downloadCover({
        id: 2,
        url: "https://example.com/not-found.jpg",
      });
      expect(result).toBe(false);
      expect(
        await pathExists(
          path.join(directory, `/COVERS_PATH/${release.hash}-cover.jpg`)
        )
      ).toBe(false);
      expect(send).not.toHaveBeenCalled();
    }
  });
});

describe("unGroupSelectedRelease function", () => {
  it("does nothing if no release is selected", async () => {
    const send = vi.fn();
    const { unGroupSelectedRelease } = releaseController({
      ...defaultParams,
      send,
      stateManager: {
        getSelectedReleases: () => [],
      } as StateManager,
    });
    await unGroupSelectedRelease();
    expect(send).not.toHaveBeenCalled();
  });
  it("unGroups the selected release", async () => {
    const releases = getFakeReleasesForArtist(1, 2);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.createMany({ data: releases });
    await prisma.release.update({
      where: { id: 2 },
      data: { mainReleaseId: 1 },
    });
    const updatedRelease = await prisma.release.findFirst({
      where: { id: 1 },
      include: { subReleases: true },
    });

    const send = vi.fn();
    const { unGroupSelectedRelease } = releaseController({
      ...defaultParams,
      send,
      stateManager: {
        getSelectedReleases: () =>
          [updatedRelease] as ReleaseWithArtistAndSubReleases[],
      } as StateManager,
    });
    await unGroupSelectedRelease();
    send("mutate", [
      ["releases", "latest"],
      ["artists", releases[0].artist_id],
    ]);
    expect(send).toHaveBeenCalledWith("mutate", [
      ["releases", "latest"],
      ["artists", 1],
    ]);
    expect(send).toHaveBeenCalledWith("clearSelection");
  });
});

describe("addAdditionalArtist function", () => {
  it("adds the given additional artist to the given release", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    const artists = getFakeArtists({ length: 2 });
    await prisma.artist.createMany({ data: artists });
    await prisma.release.create({ data: release });

    const send = vi.fn();

    const { addAdditionalArtist } = releaseController({
      ...defaultParams,
      send,
    });

    const updatedRelease = await addAdditionalArtist({
      release_id: release.id,
      artist_id: artists[1].id,
    });

    expect(updatedRelease.additionalArtists[0]).toMatchObject(artists[1]);

    expect(send).toHaveBeenCalledWith("mutate", [
      ["releases", release.id],
      ["artists", artists[0].id],
      ["artists", artists[1].id],
    ]);
  });
});

describe("removeAdditionalArtist function", () => {
  it("removes the given additional artist from the given release", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    const artists = getFakeArtists({ length: 2 });
    await prisma.artist.createMany({ data: artists });
    await prisma.release.create({ data: release });

    const send = vi.fn();

    const { addAdditionalArtist, removeAdditionalArtist } = releaseController({
      ...defaultParams,
      send,
    });

    await addAdditionalArtist({
      release_id: release.id,
      artist_id: artists[1].id,
    });

    const updatedRelease = await removeAdditionalArtist({
      release_id: release.id,
      artist_id: artists[1].id,
    });

    expect(updatedRelease.additionalArtists).not.toContainEqual(artists[1]);

    expect(send).toHaveBeenCalledWith("mutate", [
      ["releases", release.id],
      ["artists", artists[0].id],
      ["artists", artists[1].id],
    ]);
  });
});

describe("deleteRelease function", () => {
  it("does nothing if no release is found", async () => {
    const { deleteRelease } = releaseController(defaultParams);
    const result = await deleteRelease(1);
    expect(result).toBeFalsy();
  });

  it("deletes the passed release from library", async () => {
    const releases = getFakeReleasesForArtist(1);
    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });

    const { deleteRelease, groupReleases } = releaseController(defaultParams);

    await groupReleases({
      mainRelease: {
        id: 1,
        title: "main release title",
      },
      discInfo: [
        { id: 1, title: "disc 1", number: 1 },
        { id: 2, title: "disc 2", number: 2 },
      ],
    });

    await deleteRelease(1);

    const updatedReleases = await prisma.release.findMany();
    expect(updatedReleases).toMatchObject(releases.slice(2));
  });
});

describe("deleteReleases function", () => {
  it("does nothing is the cancel button is pressed", async () => {
    const send = vi.fn();
    const { deleteReleases } = releaseController({
      ...defaultParams,
      send,
      openConfirmDialog: () => 1,
    });

    await deleteReleases([4, 5]);
    expect(send).not.toHaveBeenCalled();
  });

  it("deletes the passed releases from library", async () => {
    const releases = getFakeReleasesForArtist(1);
    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });
    const send = vi.fn();

    const { deleteReleases } = releaseController({
      ...defaultParams,
      send,
    });

    await deleteReleases([4, 5]);

    const updatedReleases = await prisma.release.findMany();
    const updatedArtist = await prisma.artist.findFirst({
      where: { id: 1 },
      include: { releases: true },
    });

    expect(updatedReleases).toMatchObject(releases.slice(0, 3));
    expect(updatedArtist.releases).toMatchObject(releases.slice(0, 3));

    expect(send).toHaveBeenCalledWith("mutate", [
      ["releases", "latest"],
      ["releases", 4],
      ["releases", 5],
    ]);
    expect(send).toHaveBeenCalledWith("clearSelection");
  });
});

describe("groupReleases function", () => {
  it("groups the passed releases together", async () => {
    const releases = getFakeReleasesForArtist(1);
    const artists = getFakeArtists({ length: 2 });
    await prisma.artist.createMany({ data: artists });
    await prisma.release.createMany({ data: releases });
    await prisma.release.update({
      where: { id: 1 },
      data: { additionalArtists: { connect: [{ id: 2 }] } },
    });

    const send = vi.fn();

    const { groupReleases } = releaseController({
      ...defaultParams,
      send,
    });

    await groupReleases({
      mainRelease: {
        id: 1,
        title: "main release title",
      },
      discInfo: [
        { id: 1, title: "disc 1", number: 1 },
        { id: 2, title: "disc 2", number: 2 },
      ],
    });

    expect(send).toHaveBeenCalledWith("mutate", [
      ["releases", "latest"],
      ["artists", 1],
      ["artists", 2],
    ]);
    expect(send).toHaveBeenCalledWith("clearSelection");
    expect(send).toHaveBeenCalledWith("notify", {
      message: "2 releases grouped",
      type: "success",
    });

    const updatedRelease = await prisma.release.findFirst({
      where: { id: 1 },
      include: {
        subReleases: {
          include: {
            mainRelease: true,
          },
        },
      },
    });

    expect(updatedRelease).toMatchObject({
      ...releases[0],
      title: "main release title",
      normalizedTitle: "main release title",
      discTitle: "disc 1",
      subReleases: [
        {
          ...releases[1],
          title: "main release title",
          normalizedTitle: "main release title",
          mainReleaseId: 1,
          discNumber: 2,
          discTitle: "disc 2",
        },
      ],
    });

    expect(updatedRelease.subReleases[0].mainRelease).toMatchObject({
      ...releases[0],
      title: "main release title",
      normalizedTitle: "main release title",
      discTitle: "disc 1",
    });
  });
});
