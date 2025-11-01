import prisma from "../db/prisma";
import { settingsController } from "./settings";
import { clearPrisma } from "../../test/prisma-utils";
import { getFakeSettings } from "../../test/seed";

afterEach(clearPrisma);

const defaultParams = {
  send: vi.fn(),
};

describe("settingsController - init function", () => {
  it("returns stores the default Settings if no settings are found", async () => {
    const { init, getSettings } = settingsController(defaultParams);

    await init();

    expect(await getSettings()).toMatchObject({
      PLAYER_PATH: "",
      TAGGER_PATH: "",
      DISCOGS_KEY: "",
      DISCOGS_SECRET: "",
      LIBRARY_PATH: "",
      COVERS_PATH: "assets/covers",
      USE_SMART_IMPORT: false,
    });
  });
});

describe("settingsController - getSetting function", () => {
  it("returns the value of the given key", async () => {
    const data = getFakeSettings();
    await prisma.settings.create({ data });

    const { init, getSetting } = settingsController(defaultParams);
    await init();

    expect(getSetting("PLAYER_PATH")).toBe("PLAYER_PATH");
  });
});

describe("settingsController - getSettings function", () => {
  it("returns the current Settings", async () => {
    const data = getFakeSettings();
    await prisma.settings.create({ data });

    const { getSettings } = settingsController(defaultParams);

    expect(await getSettings()).toMatchObject(data);
  });
});

describe("settingsController - createSettings function", () => {
  it("creates new Settings", async () => {
    const data = getFakeSettings();

    const { getSettings, createSettings } = settingsController(defaultParams);
    await createSettings(data);

    expect(await getSettings()).toMatchObject(data);
  });
});

describe("settingsController - updateSettings function", () => {
  it("updates the current Settings", async () => {
    const data = getFakeSettings();
    await prisma.settings.create({ data });

    const send = vi.fn();

    const { getSettings, getSetting, updateSettings, init } =
      settingsController({ send });
    await init();

    expect(getSetting("PLAYER_PATH")).toBe("PLAYER_PATH");
    expect(getSetting("USE_SMART_IMPORT")).toBe(false);

    await updateSettings({
      ...data,
      PLAYER_PATH: "/new/path",
      USE_SMART_IMPORT: true,
    });

    expect(getSetting("PLAYER_PATH")).toBe("/new/path");
    expect(getSetting("USE_SMART_IMPORT")).toBe(true);

    expect(await getSettings()).toMatchObject({
      ...data,
      PLAYER_PATH: "/new/path",
      USE_SMART_IMPORT: true,
    });

    expect(send).toHaveBeenCalledWith("settingsUpdate", {
      ...data,
      PLAYER_PATH: "/new/path",
      USE_SMART_IMPORT: true,
    });
  });
});

describe("settingsController - dismissOnboarding function", () => {
  it("saves the onboarding dismiss status in the settings", async () => {
    const data = getFakeSettings();
    await prisma.settings.create({
      data: {
        ...data,
        SHOW_ONBOARDING_ON_STARTUP: true,
      },
    });

    const send = vi.fn();

    const { getSettings, getSetting, dismissOnboarding, init } =
      settingsController({ send });
    await init();

    expect(getSetting("SHOW_ONBOARDING_ON_STARTUP")).toBe(true);

    await dismissOnboarding();

    expect(getSetting("SHOW_ONBOARDING_ON_STARTUP")).toBe(false);

    expect(await getSettings()).toMatchObject({
      ...data,
      COVERS_PATH: "assets/covers",
      SHOW_ONBOARDING_ON_STARTUP: false,
    });
  });
});
