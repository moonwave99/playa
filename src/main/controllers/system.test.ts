import prisma from "../db/prisma";
import path from "node:path";
import { clearPrisma } from "@/test/prisma-utils";
import { testFs } from "@moonwave99/test-fs";
import { getSetting, withPath } from "@/test/utils";
import {
  getFakeArtist,
  getFakeReleasesForArtist,
  getFakeTracksForRelease,
} from "../../test/seed";
import { shell, type IpcMainEvent } from "electron";
import * as run from "../run";
import { systemController } from "./system";

afterEach(clearPrisma);

vi.mock("../run");

const defaultParams = {
  showErrorBox: vi.fn(),
  getSetting,
  withPath,
};

describe("system - playback function", () => {
  it("does nothing is no release if found", async () => {
    const { playback } = systemController(defaultParams);
    const result = await playback({ release_id: 1 });
    expect(result).toBeFalsy();
  });

  it("does nothing is no track if found", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const { playback } = systemController(defaultParams);
    const result = await playback({ release_id: 1, track_id: 1 });
    expect(result).toBeFalsy();
  });

  it("shows an error box if no player path is set", async () => {
    const showErrorBox = vi.fn();

    const { playback } = systemController({
      ...defaultParams,
      showErrorBox,
      getSetting: () => false,
    });
    const spy = vi.spyOn(run, "run");
    const result = await playback({ release_id: 1 });

    expect(showErrorBox).toHaveBeenCalledWith(
      "Application Error",
      "You should set the Player path in settings"
    );
    expect(result).toBeFalsy();
    expect(spy).not.toHaveBeenCalled();
  });

  it("calls run with the right path if the release is found", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const { playback } = systemController(defaultParams);
    const spy = vi.spyOn(run, "run");
    const result = await playback({ release_id: 1 });

    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith("open", [
      "-a",
      "PLAYER_PATH",
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1-1",
    ]);
  });

  it("calls run with the right paths if the release has subReleases", async () => {
    const releases = getFakeReleasesForArtist(1, 2);

    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.createMany({ data: releases });
    await prisma.track.createMany({ data: getFakeTracksForRelease(1) });
    await prisma.release.update({
      where: { id: 2 },
      data: { mainReleaseId: 1 },
    });

    const { playback } = systemController(defaultParams);
    const spy = vi.spyOn(run, "run");

    const result = await playback({ release_id: 1 });
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith("open", [
      "-a",
      "PLAYER_PATH",
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1-1",
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1-2",
    ]);
  });

  it("calls run with the right path if the track is found", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });
    await prisma.track.createMany({ data: getFakeTracksForRelease(1) });

    const { playback } = systemController(defaultParams);
    const spy = vi.spyOn(run, "run");
    const result = await playback({ release_id: 1, track_id: 1 });
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith("open", [
      "-a",
      "PLAYER_PATH",
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1-1/01 - Track 01.mp3",
    ]);
  });
});

describe("system - openFolderInTagger function", () => {
  it("shows an error box if no tagger path is set", async () => {
    const showErrorBox = vi.fn();

    const { openFolderInTagger } = systemController({
      ...defaultParams,
      showErrorBox,
      getSetting: () => false,
    });
    const spy = vi.spyOn(run, "run");
    const result = await openFolderInTagger("some/path");

    expect(showErrorBox).toHaveBeenCalledWith(
      "Application Error",
      "You should set the Tagger path in settings"
    );
    expect(result).toBeFalsy();
    expect(spy).not.toHaveBeenCalled();
  });

  it("calls run with the right path", async () => {
    const { openFolderInTagger } = systemController(defaultParams);
    const spy = vi.spyOn(run, "run");
    const result = await openFolderInTagger("some/path");
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith("open", [
      "-a",
      "TAGGER_PATH",
      "LIBRARY_PATH/some/path",
    ]);
  });
});

describe("system - openReleaseInTagger function", () => {
  it("shows an error box if no tagger path is set", async () => {
    const showErrorBox = vi.fn();
    await prisma.release.create({ data: getFakeReleasesForArtist(1).at(0) });

    const { openReleaseInTagger } = systemController({
      ...defaultParams,
      showErrorBox,
      getSetting: () => false,
    });
    const spy = vi.spyOn(run, "run");
    const result = await openReleaseInTagger(1);

    expect(showErrorBox).toHaveBeenCalledWith(
      "Application Error",
      "You should set the Tagger path in settings"
    );
    expect(result).toBeFalsy();
    expect(spy).not.toHaveBeenCalled();
  });

  it("does nothing is no release if found", async () => {
    const { openReleaseInTagger } = systemController(defaultParams);
    const result = await openReleaseInTagger(1);
    expect(result).toBeFalsy();
  });

  it("calls run with the right path if the release if found", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const { openReleaseInTagger } = systemController(defaultParams);
    const spy = vi.spyOn(run, "run");
    const result = await openReleaseInTagger(1);
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith("open", [
      "-a",
      "TAGGER_PATH",
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1-1",
    ]);
  });
});

describe("system revealEntityInFinder function", () => {
  it("does nothing if no release is found", async () => {
    const { revealEntityInFinder } = systemController(defaultParams);
    const result = await revealEntityInFinder({ entityType: "release", id: 1 });
    expect(result).toBeFalsy();
  });

  it("opens the folder in finder if a release is found", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const { revealEntityInFinder } = systemController(defaultParams);
    const spy = vi.spyOn(shell, "openPath");

    const result = await revealEntityInFinder({ entityType: "release", id: 1 });
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1-1"
    );
  });

  it("opens the folder in finder if a track is found", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    const tracks = getFakeTracksForRelease(1);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });
    await prisma.track.createMany({ data: tracks });

    const { revealEntityInFinder } = systemController(defaultParams);
    const spy = vi.spyOn(shell, "openPath");

    const result = await revealEntityInFinder({ entityType: "track", id: 1 });
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1-1/01 - Track 01.mp3"
    );
  });
});

describe("system - startDrag, function", () => {
  it("should do nothing is the release is not found", async () => {
    const { startDrag } = systemController(defaultParams);
    const event = {
      sender: {
        startDrag: vi.fn(),
      },
    } as unknown as IpcMainEvent;
    const spy = vi.spyOn(event.sender, "startDrag");
    await startDrag(1, event);
    expect(spy).not.toHaveBeenCalled();
  });

  it("should pass the dragged folder to the drag event", async (context) => {
    const directory = await testFs(
      {
        "/LIBRARY_PATH/A/Artist 1": {
          "[Album]": {
            "2000 - Release 1-1": {},
          },
        },
      },
      context.task.id
    );
    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const { startDrag } = systemController({
      ...defaultParams,
      withPath: (key, filePath) => path.join(directory, key, filePath),
    });
    const event = {
      sender: {
        startDrag: vi.fn(),
      },
    } as unknown as IpcMainEvent;
    const spy = vi.spyOn(event.sender, "startDrag");
    await startDrag(1, event);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        file: path.join(
          directory,
          "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1-1"
        ),
      })
    );
  });

  describe("system - pathExists, function", () => {
    it("checks if the passed path exists in the Library", async (context) => {
      const directory = await testFs(
        {
          "/LIBRARY_PATH/A/Artist 1/[Album]/2000 - Album 1": {},
        },
        context.task.id
      );
      const { pathExists } = systemController({
        ...defaultParams,
        withPath: (key, filePath) => path.join(directory, key, filePath),
      });

      expect(await pathExists("A/Artist 1/[Album]/2000 - Album 1")).toBe(true);
      expect(await pathExists("A/Artist 1/[Album]/2000 - Album 2")).toBe(false);
    });
  });
});
