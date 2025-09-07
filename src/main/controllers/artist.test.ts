import prisma from "../db/prisma";
import { dialog } from "electron";
import path from "path";
import fsExtra, { existsSync } from "fs-extra";
import { artistController } from "./artist";
import { mockFs } from "@/test/mock-fs";
import { StateManager } from "../state";
import { clearPrisma } from "@/test/prisma-utils";
import { getFakeArtist, getFakeArtists } from "@/test/seed";
import { withPath } from "@/test/utils";

afterEach(clearPrisma);

const defaultParams = {
  withPath,
  state: {} as StateManager,
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
    expect(result).toMatchObject(artists);
  });
});

describe("artist - editArtist function", () => {
  it("shows a warning if the new path already exists", async (context) => {
    const directory = await mockFs(
      { "/LIBRARY_PATH/A/Artist New": {} },
      context.task.id
    );
    const state = { setCurrentArtist: vi.fn() } as unknown as StateManager;
    const { editArtist } = artistController({
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
    const directory = await mockFs(
      { "/LIBRARY_PATH/A/Artist 1": {} },
      context.task.id
    );
    const state = { setCurrentArtist: vi.fn() } as unknown as StateManager;
    const { editArtist } = artistController({
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
      state,
    });

    await prisma.artist.create({ data: artist });

    const result = await editArtist({
      ...artist,
      newName: "Artist New",
      newPath: "A/Artist New",
    });

    expect(result).toBeTruthy();

    expect(existsSync(path.join(directory, "LIBRARY_PATH/A/Artist"))).toBe(
      false
    );
    expect(existsSync(path.join(directory, "LIBRARY_PATH/A/Artist New"))).toBe(
      true
    );

    expect(state.setCurrentArtist).toHaveBeenCalled();
  });
});
