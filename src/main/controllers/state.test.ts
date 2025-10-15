import prisma from "../db/prisma";
import { clearPrisma } from "@/test/prisma-utils";
import { stateController } from "./state";
import { StateManager } from "../stateManager";
import { getFakeArtist } from "../../test/seed";
import {
  ArtistWithReleasesFull,
  ReleaseWithArtistAndSubReleases,
} from "@/types/types";

afterEach(clearPrisma);

const defaultParams = {
  send: vi.fn(),
  stateManager: new StateManager(),
};

describe("stateController - setInputFocused function", () => {
  it("sets the input focus status", async () => {
    const stateManager = new StateManager();
    const { setInputFocused } = stateController({
      ...defaultParams,
      stateManager,
    });
    expect(stateManager.isInputFocused()).toBe(false);
    setInputFocused(true);
    expect(stateManager.isInputFocused()).toBe(true);
    setInputFocused(false);
    expect(stateManager.isInputFocused()).toBe(false);
  });
});

describe("stateController - selectReleases function", () => {
  it("sets the current release selection", async () => {
    const stateManager = new StateManager();
    const { selectReleases } = stateController({
      ...defaultParams,
      stateManager,
    });
    expect(stateManager.getSelectedReleases()).toEqual([]);
    selectReleases([{ id: 1 }, { id: 2 }] as ReleaseWithArtistAndSubReleases[]);
    expect(stateManager.getSelectedReleases()).toMatchObject([
      { id: 1 },
      { id: 2 },
    ]);
  });
});

describe("stateController - navigate function", () => {
  it("sets the current path", async () => {
    const stateManager = new StateManager();
    const { navigate } = stateController({
      ...defaultParams,
      stateManager,
    });
    expect(stateManager.getState().path).toBe("");
    navigate("/homepage");
    expect(stateManager.getState().path).toBe("/homepage");
  });
});

describe("stateController - refreshCurrentArtist function", () => {
  it("refreshes the current artist", async () => {
    const stateManager = new StateManager();
    const { refreshCurrentArtist } = stateController({
      ...defaultParams,
      stateManager,
    });
    const data = getFakeArtist(1);
    await prisma.artist.create({ data });
    expect(stateManager.getState().currentArtist).toBe(null);
    stateManager.setCurrentArtist({ id: 1 } as ArtistWithReleasesFull);
    await refreshCurrentArtist();
    expect(stateManager.getState().currentArtist).toMatchObject(data);
  });
});

describe("stateController - clearSelection function", () => {
  it("dispatches a clearSelection message", async () => {
    const send = vi.fn();
    const { clearSelection } = stateController({
      ...defaultParams,
      send,
    });
    clearSelection();
    expect(send).toHaveBeenCalledWith("clearSelection");
  });
});
