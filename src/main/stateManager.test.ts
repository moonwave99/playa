import { StateManager } from "./stateManager";

describe("StateManager - constructor", () => {
  it("should initialize a new StateManager", () => {
    const state = new StateManager();
    expect(state.getState()).toEqual({
      selection: {
        artist: [],
        release: [],
        collection: [],
        group: [],
        track: [],
      },
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
    state.setSelection("artist", [1, 2]);
    expect(state.getSelection("artist")).toEqual([1, 2]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        selection: {
          artist: [1, 2],
          release: [],
          collection: [],
          group: [],
          track: [],
        },
      })
    );
  });

  it("should set and get the corresponding value when a function is passed as argument", () => {
    const onChange = vi.fn();
    const state = new StateManager();
    state.onStateChange(onChange);
    state.setSelection("artist", () => [1, 2]);
    expect(state.getSelection("artist")).toEqual([1, 2]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        selection: {
          artist: [1, 2],
          release: [],
          collection: [],
          group: [],
          track: [],
        },
      })
    );
  });

  it("should clear the other selections if the clearOther options is set to true", () => {
    const onChange = vi.fn();
    const state = new StateManager();
    state.onStateChange(onChange);
    state.setSelection("artist", [1, 2]);
    expect(state.getSelection("artist")).toEqual([1, 2]);

    state.setSelection("release", [1], { clearOther: true });

    expect(state.getState().selection).toEqual({
      artist: [],
      release: [1],
      collection: [],
      group: [],
      track: [],
    });
  });
});

describe("StateManager - reset", () => {
  it("should reset the state", () => {
    const onChange = vi.fn();
    const state = new StateManager();
    state.onStateChange(onChange);

    state.setPath("/path/to/somewhere");
    state.setSelection("artist", [1, 2]);
    state.setImporting(true);
    state.setInputFocused(true);
    state.reset();

    expect(onChange).toHaveBeenCalledWith({
      selection: {
        artist: [],
        release: [],
        collection: [],
        group: [],
        track: [],
      },
      isInputFocused: false,
      isImporting: false,
      path: "",
    });
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

describe("StateManager - isPage", () => {
  it("should check if the current page matches the passed pattern", () => {
    const state = new StateManager();
    state.setPath("/artists/1");
    expect(state.isPage("artist")).toBe(true);
    expect(state.isPage("artists")).toBe(false);

    state.setPath("/artists");
    expect(state.isPage("artist")).toBe(false);
    expect(state.isPage("artists")).toBe(true);
  });
});
