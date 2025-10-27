import path from "node:path";
import { ensureDir } from "fs-extra";
import { app } from "electron";
import type { Send, Settings } from "@/types/types";
import {
  getSettings,
  createSettings,
  updateSettings as _updateSettings,
} from "../db/settings";

import { DEFAULT_SETTINGS } from "@/constants";

import { log } from "../logger";

export type GetSetting = (key: keyof Omit<Settings, "id">) => unknown;

type SettingsControllerParams = {
  send: Send;
};

export function settingsController({ send }: SettingsControllerParams) {
  let settings: Omit<Settings, "id"> = null;

  async function init() {
    try {
      settings = await getSettings();
    } catch {
      log("settings:init", "no settings found");
      settings = await createSettings(DEFAULT_SETTINGS);
      log("settings:init", "settings created", settings);
    } finally {
      if (!settings.COVERS_PATH || settings.COVERS_PATH === "COVERS_PATH") {
        const COVERS_PATH = path.join(
          app.getPath("userData"),
          "assets",
          "covers"
        );
        await ensureDir(COVERS_PATH);
        await updateSettings({ ...settings, COVERS_PATH });
      }
      log("settings:init", "settings loaded", settings);
    }
  }

  function getSetting(key: keyof Omit<Settings, "id">) {
    return settings[key];
  }

  async function updateSettings(newSettings: Omit<Settings, "id">) {
    await _updateSettings(newSettings);
    settings = newSettings;
    send("settingsUpdate", settings);
    return settings;
  }

  async function dismissOnboarding() {
    return updateSettings({ ...settings, SHOW_ONBOARDING_ON_STARTUP: false });
  }

  return {
    init,
    getSetting,
    getSettings,
    createSettings,
    updateSettings,
    dismissOnboarding,
  };
}

export const actions: (keyof ReturnType<typeof settingsController>)[] = [
  "getSettings",
  "createSettings",
  "updateSettings",
  "dismissOnboarding",
];
