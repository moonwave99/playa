import { ArtistWithReleasesFull, ReleaseWithArtistAndSubreleases } from "@/types/types";
import { StateManager } from "./state";
import prisma from './db/__mocks__/prisma';
import { getFakeArtist } from "@/test/utils";

vi.mock('./db/prisma');

describe('StateManager - constructor', () => {
  it('should initialize a new StateManager', () => {
    const state = new StateManager();
    expect(state.getState()).toEqual({
      selectedReleases: [],
      currentArtist: null,
      isInputFocused: false,
      isImporting: false,
      path: '',
    });
  });
  it('should not throw if no handler is provided', () => {
    expect(() => {
      const state = new StateManager();
      state.setInputFocused(true);
    }).not.toThrowError();
  });
});

describe('StateManager - setCurrentArtist / getCurrentArtist', () => {
  it('should set and get the corresponding value', () => {
    const onChange = vi.fn();
    const state = new StateManager();
    state.onStateChange(onChange);
    state.setCurrentArtist({ id: 1 } as ArtistWithReleasesFull);
    expect(state.getCurrentArtist()).toMatchObject({ id: 1 });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      currentArtist: { id: 1 }
    }));
  });
});

describe('StateManager - setSelectedReleases / getSelectedReleases', () => {
  it('should set and get the corresponding value', () => {
    const onChange = vi.fn();
    const state = new StateManager();
    state.onStateChange(onChange);
    state.setSelectedReleases([{ id: 1 }, { id: 2 }] as ReleaseWithArtistAndSubreleases[]);
    expect(state.getSelectedReleases()).toMatchObject([{ id: 1 }, { id: 2 }]);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      selectedReleases: [{ id: 1 }, { id: 2 }]
    }));
  });
});

describe('StateManager - setInputFocused / isInputFocused', () => {
  it('should set and get the corresponding value', () => {
    const onChange = vi.fn();
    const state = new StateManager();
    state.onStateChange(onChange);
    state.setInputFocused(true);
    expect(state.isInputFocused()).toBe(true);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      isInputFocused: true
    }));
  });
});

describe('StateManager - setImporting / isImporting', () => {
  it('should set and get the corresponding value', () => {
    const onChange = vi.fn();
    const state = new StateManager();
    state.onStateChange(onChange);
    state.setImporting(true);
    expect(state.isImporting()).toBe(true);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      isImporting: true
    }));
  });
});

describe('StateManager - setPath', () => {
  it('should set path and update the current artist correspondingly', async () => {
    {
      const artist = getFakeArtist(1)
      prisma.artist.findFirst.mockResolvedValue(artist);
      const onChange = vi.fn();
      const state = new StateManager();
      state.onStateChange(onChange);
      await state.setPath('/artists/1');
      expect(state.getCurrentArtist()).toMatchObject({ id: 1 });
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
        path: '/artists/1',
        currentArtist: artist
      }));
    }
    {
      const onChange = vi.fn();
      const state = new StateManager();
      state.onStateChange(onChange);
      await state.setPath('/');
      expect(state.getCurrentArtist()).toBe(null)
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
        path: '/',
        currentArtist: null
      }));
    }
  });
});