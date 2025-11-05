import prisma from "../db/prisma";
import { clearPrisma } from "@/test/prisma-utils";
import { withPath, getSetting } from "@/test/utils";
import path from "path";
import { pathExists } from "fs-extra";
import { releaseController } from "./release";
import { testFs } from "@moonwave99/test-fs";
import { ReleaseType, ReleaseWithArtist } from "@/types/types";
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
  send: vi.fn(),
  stateManager: {} as StateManager,
  showErrorBox: vi.fn(),
  openConfirmDialog: () => true,
};

describe("getReleaseTitleInfo function", () => {
  it("returns the release title info", async () => {
    const releases = getFakeReleasesForArtist(1, 1);
    const artist = getFakeArtist(1);
    await prisma.artist.create({ data: artist });
    await prisma.release.createMany({ data: releases });

    const { getReleaseTitleInfo } = releaseController(defaultParams);
    expect(await getReleaseTitleInfo(1)).toMatchObject({
      title: "Release 1-1",
      artist: {
        name: "Artist 1",
      },
    });
  });
});

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

  it("should update the release with the given information", async (context) => {
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
      newDiscTitle: "Release Edited",
      newTitle: "Release Edited",
      newType: "EP" as ReleaseType,
      newYear: 2001,
    };

    const result = (await editRelease([
      { ...release, ...newInfo },
    ])) as ReleaseWithArtist[];

    expect(result[0]).toMatchObject({
      path: "A/Artist 1/[Album]/2000 - Release 1",
      discTitle: null,
      title: "Release Edited",
      type: "EP" as ReleaseType,
      year: 2001,
    });

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
      newDiscTitle: "Release Edited",
      newTitle: "Release Edited",
      newType: "EP" as ReleaseType,
      newYear: 2001,
    };

    const result = (await editRelease([
      { ...release, ...newInfo },
    ])) as ReleaseWithArtist[];

    expect(result[0]).toMatchObject({
      path: "A/Artist 1/[Album]/2000 - Release 1",
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
        getSelection: () => [] as number[],
      } as unknown as StateManager,
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
        getSelection: () => [updatedRelease.id],
      } as unknown as StateManager,
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

describe("addNewAdditionalArtist function", () => {
  it("creates a new artist and adds it to the given release", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.release.create({ data: release });

    const send = vi.fn();

    const { addNewAdditionalArtist } = releaseController({
      ...defaultParams,
      send,
    });

    const updatedRelease = await addNewAdditionalArtist({
      release_id: release.id,
      name: "New Artist",
    });

    expect(
      (updatedRelease as ReleaseWithArtist).additionalArtists[0]
    ).toMatchObject({
      id: 1,
      name: "New Artist",
    });

    expect(send).toHaveBeenCalledWith("mutate", [
      ["releases", "latest"],
      ["releases", release.id],
      ["artists", 1],
    ]);
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

describe("deleteReleases function", () => {
  it("does nothing is the cancel button is pressed", async () => {
    const send = vi.fn();
    const { deleteReleases } = releaseController({
      ...defaultParams,
      send,
      openConfirmDialog: () => false,
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
