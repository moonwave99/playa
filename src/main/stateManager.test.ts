import prisma from "./db/prisma";
import { clearPrisma } from "@/test/prisma-utils";
import { StateManager } from "./stateManager";
import {
  getFakeArtist,
  getFakeCollection,
  getFakeGroup,
  getFakeReleasesForArtist,
} from "../test/seed";

afterEach(clearPrisma);

describe("StateManager - constructor", () => {
  it("should initialize a new StateManager", () => {
    const state = new StateManager();
    expect(state.getState()).toEqual({
      selection: [],
      isInputFocused: false,
      isImporting: false,
      path: "",
    });
  });
  it("should not throw if no handler is provided", () => {
    expect(() => {
      const state = new StateManager();
      state.setInputFocused(true);
    }).not.toThrowError();
  });
});

describe("StateManager - setSelection / getSelection", () => {
  it("should set and get the corresponding value", () => {
    const onChange = vi.fn();
    const state = new StateManager();
    state.onStateChange(onChange);
    state.setSelection([1, 2]);
    expect(state.getSelection()).toEqual([1, 2]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        selection: [1, 2],
      })
    );
  });
});

describe("StateManager - setInputFocused / isInputFocused", () => {
  it("should set and get the corresponding value", () => {
    const onChange = vi.fn();
    const state = new StateManager();
    state.onStateChange(onChange);
    state.setInputFocused(true);
    expect(state.isInputFocused()).toBe(true);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        isInputFocused: true,
      })
    );
  });
});

describe("StateManager - setImporting / isImporting", () => {
  it("should set and get the corresponding value", () => {
    const onChange = vi.fn();
    const state = new StateManager();
    state.onStateChange(onChange);
    state.setImporting(true);
    expect(state.isImporting()).toBe(true);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        isImporting: true,
      })
    );
  });
});

describe("StateManager - setPath", () => {
  it("should set the path", () => {
    const onChange = vi.fn();
    const state = new StateManager();
    state.onStateChange(onChange);
    state.setPath("/artists/1");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/artists/1",
      })
    );
  });
});

describe("StateManager - getRouteMatch", () => {
  it("should return null if the current path doesn't match the passed pattern", () => {
    const state = new StateManager();
    state.setPath("/");
    expect(state.getRouteMatch("/collections/:id")).toBe(null);
  });
  it("should get the route params it the current path matches the passed pattern", () => {
    const state = new StateManager();
    state.setPath("/collections/1");
    expect(state.getRouteMatch("/collections/:id")).toMatchObject({
      params: { id: "1" },
    });
  });
});

describe("StateManager - isPath", () => {
  it("should return false if the current path doesn't match the passed pattern", () => {
    const state = new StateManager();
    state.setPath("/");
    expect(state.isPage("collection")).toBe(false);
  });
  it("should return true if the current path doesn't match the passed pattern", () => {
    const state = new StateManager();
    state.setPath("/collections/1");
    expect(state.isPage("collection")).toBe(true);
  });
});

describe("StateManager - getCurrentEntity", () => {
  it("returns null if the current location has no associated entity", async () => {
    const state = new StateManager();
    state.setPath("/");
    expect(await state.getCurrentEntity()).toBe(null);
  });
  it("returns the current entity if the page is /{entity}/:id", async () => {
    {
      const artist = getFakeArtist(1);
      await prisma.artist.create({ data: artist });
      const state = new StateManager();
      state.setPath("/artists/1");
      expect(await state.getCurrentEntity()).toMatchObject(artist);
    }
    {
      const release = getFakeReleasesForArtist(1).at(0);
      await prisma.release.create({ data: release });
      const state = new StateManager();
      state.setPath("/releases/1");
      expect(await state.getCurrentEntity()).toMatchObject(release);
    }
    {
      const collection = getFakeCollection(1);
      await prisma.collection.create({ data: collection });
      const state = new StateManager();
      state.setPath("/collections/1");
      expect(await state.getCurrentEntity()).toMatchObject(collection);
    }
    {
      const group = getFakeGroup(1);
      await prisma.group.create({ data: group });
      const state = new StateManager();
      state.setPath("/groups/1");
      expect(await state.getCurrentEntity()).toMatchObject(group);
    }
  });
});
