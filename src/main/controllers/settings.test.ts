import prisma from "../db/prisma";
import { settingsController } from "./settings";
import { clearPrisma } from "../../test/prisma-utils";
import { getFakeSettings } from "../../test/seed";

afterEach(clearPrisma);

describe("settingsController - getSetting function", () => {
  it("returns the value of the given key", async () => {
    const data = getFakeSettings();
    await prisma.settings.create({ data });

    const { init, getSetting } = settingsController();
    await init();

    expect(getSetting("PLAYER_PATH")).toBe("PLAYER_PATH");
  });
});

describe("settingsController - getSettings function", () => {
  it("returns the current Settings", async () => {
    const data = getFakeSettings();
    await prisma.settings.create({ data });

    const { getSettings } = settingsController();

    expect(await getSettings()).toMatchObject(data);
  });
});

describe("settingsController - createSettings function", () => {
  it("creates new Settings", async () => {
    const data = getFakeSettings();

    const { getSettings, createSettings } = settingsController();
    await createSettings(data);

    expect(await getSettings()).toMatchObject(data);
  });
});

describe("settingsController - updateSettings function", () => {
  it("updates the current Settings", async () => {
    const data = getFakeSettings();
    await prisma.settings.create({ data });

    const { getSettings, getSetting, updateSettings, init } =
      settingsController();
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
  });
});
