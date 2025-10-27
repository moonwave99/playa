import prisma from "../db/prisma";
import { clearPrisma } from "@/test/prisma-utils";
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
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1",
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
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1",
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 2",
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
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1/01 - Track 1.mp3",
    ]);
  });
});

describe("system - openTagger function", () => {
  it("shows an error box if no player path is set", async () => {
    const showErrorBox = vi.fn();

    const { openTagger } = systemController({
      ...defaultParams,
      showErrorBox,
      getSetting: () => false,
    });
    const spy = vi.spyOn(run, "run");
    const result = await openTagger(1);

    expect(showErrorBox).toHaveBeenCalledWith(
      "Application Error",
      "You should set the Tagger path in settings"
    );
    expect(result).toBeFalsy();
    expect(spy).not.toHaveBeenCalled();
  });

  it("does nothing is no release if found", async () => {
    const { openTagger } = systemController(defaultParams);
    const result = await openTagger(1);
    expect(result).toBeFalsy();
  });

  it("calls run with the right path if the release if found", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const { openTagger } = systemController(defaultParams);
    const spy = vi.spyOn(run, "run");
    const result = await openTagger(1);
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith("open", [
      "-a",
      "TAGGER_PATH",
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1",
    ]);
  });
});

describe("system revealEntityInFinder function", () => {
  it("does nothing if no release is found", async () => {
    const { revealEntityInFinder } = systemController(defaultParams);
    const result = await revealEntityInFinder({ entityType: "Release", id: 1 });
    expect(result).toBeFalsy();
  });

  it("opens the folder in finder if a release is found", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const { revealEntityInFinder } = systemController(defaultParams);
    const spy = vi.spyOn(shell, "openPath");

    const result = await revealEntityInFinder({ entityType: "Release", id: 1 });
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1"
    );
  });

  it("opens the folder in finder if an artist is found", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const { revealEntityInFinder } = systemController(defaultParams);
    const spy = vi.spyOn(shell, "openPath");

    const result = await revealEntityInFinder({ entityType: "Artist", id: 1 });
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith("LIBRARY_PATH/A/Artist 1");
  });

  it("opens the folder in finder if a track is found", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    const tracks = getFakeTracksForRelease(1);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });
    await prisma.track.createMany({ data: tracks });

    const { revealEntityInFinder } = systemController(defaultParams);
    const spy = vi.spyOn(shell, "openPath");

    const result = await revealEntityInFinder({ entityType: "Track", id: 1 });
    expect(result).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1/01 - Track 1.mp3"
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

  it("should pass the dragged folder to the drag event", async () => {
    const release = getFakeReleasesForArtist(1).at(0);
    await prisma.artist.create({ data: getFakeArtist(1) });
    await prisma.release.create({ data: release });

    const { startDrag } = systemController(defaultParams);
    const event = {
      sender: {
        startDrag: vi.fn(),
      },
    } as unknown as IpcMainEvent;
    const spy = vi.spyOn(event.sender, "startDrag");
    await startDrag(1, event);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        file: "LIBRARY_PATH/A/Artist 1/[Album]/2000 - Release 1",
      })
    );
  });
});
