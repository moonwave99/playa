import { initSettings, getSetting, getSettings, setSettings } from "./settings";

vi.mock("electron-settings", () => {
  let settings: Record<string, unknown> = {};
  return {
    default: {
      setSync: (newSettings: Record<string, unknown>) =>
        (settings = newSettings),
      getSync: (key?: string) => (key ? settings[key] : settings),
    },
  };
});

beforeEach(() => setSettings({}));

const defaultSettings = {
  PLAYER_PATH: "PLAYER_PATH",
  LIBRARY_PATH: "LIBRARY_PATH",
};

vi.mock("fs-extra", () => ({
  readJSONSync: () => defaultSettings,
}));

describe("getSettings", () => {
  it("should populate the settings with defaults if nothing is stored", () => {
    setSettings({
      EXISTING_KEY: "EXISTING_VALUE",
    });
    initSettings();
    expect(getSettings()).toMatchObject({
      EXISTING_KEY: "EXISTING_VALUE",
    });
  });

  it("should recall existing settings if present", () => {
    initSettings();
    expect(getSettings()).toMatchObject(defaultSettings);
  });
});

describe("getSetting", () => {
  it("should return the setting by given key", () => {
    initSettings();
    expect(getSetting("PLAYER_PATH")).toBe("PLAYER_PATH");
  });

  it("should throw if no setting by given key is found", () => {
    initSettings();
    expect(() => getSetting("NONEXISTING")).toThrowError(
      `Cannot find NONEXISTING in settings`
    );
  });
});

describe("setSetting", () => {
  it("should store the new settings", () => {
    initSettings();
    setSettings({
      NEW_KEY: "NEW_VALUE",
    });
    expect(getSettings()).toEqual({
      NEW_KEY: "NEW_VALUE",
    });
  });
});
