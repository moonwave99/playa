import { getFakeArtist } from "@/test/utils";
import { dialog } from 'electron';
import path from 'path';
import fsExtra, { existsSync } from 'fs-extra';
import { artistController } from "./artist";
import { mockFs } from "@/test/mock-fs";
import { StateManager } from "../state";

describe('artist - editArtist function', () => {
  it('shows a warning if the new path already exists', async (context) => {
    const directory = await mockFs({ '/LIBRARY_PATH/A/Artist New': {} }, context.task.id);
    const state = { setCurrentArtist: vi.fn() } as unknown as StateManager;
    const { editArtist } = artistController({
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
      state
    });

    const moveSpy = vi.spyOn(fsExtra, 'move');
    const dialogSpy = vi.spyOn(dialog, 'showMessageBoxSync');

    const result = await editArtist({
      ...getFakeArtist(1),
      newName: 'Artist New',
      newPath: 'A/Artist New',
    });

    expect(dialogSpy).toHaveBeenCalledWith(
      null, {
      message: 'Error while renaming',
      detail: `Path A/Artist New already exists`,
      type: 'error',
      buttons: ['OK'],
    });

    expect(result).toBe(false);
    expect(moveSpy).not.toHaveBeenCalled();
    expect(state.setCurrentArtist).not.toHaveBeenCalled();
  });

  it('updates the artist with the given information', async (context) => {
    const directory = await mockFs({ '/LIBRARY_PATH/A/Artist': {} }, context?.task.id);
    const state = { setCurrentArtist: vi.fn() } as unknown as StateManager;
    const { editArtist } = artistController({
      withPath: (key, folderPath) => path.join(directory, key, folderPath),
      state
    });

    const result = await editArtist({
      ...getFakeArtist(1),
      newName: 'Artist New',
      newPath: 'A/Artist New',
    });

    expect(result).toBeTruthy();

    expect(existsSync(
      path.join(directory, 'LIBRARY_PATH/A/Artist'))
    ).toBe(false);
    expect(existsSync(
      path.join(directory, 'LIBRARY_PATH/A/Artist New'))
    ).toBe(true);

    expect(state.setCurrentArtist).toHaveBeenCalled();
  });
});