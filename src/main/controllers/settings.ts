import type { Settings } from "@/types/types";
import {
  getSettings,
  createSettings,
  updateSettings as _updateSettings,
} from "../db/settings";

import { log } from "../logger";

const DEFAULT_SETTINGS = {
  PLAYER_PATH: "",
  TAGGER_PATH: "",
  DISCOGS_KEY: "",
  DISCOGS_SECRET: "",
  LIBRARY_PATH: "",
  COVERS_PATH: "",
  USE_SMART_IMPORT: false,
};

export type GetSetting = (key: keyof Omit<Settings, "id">) => unknown;

export function settingsController() {
  let settings: Omit<Settings, "id"> = null;

  async function init() {
    try {
      settings = await getSettings();
    } catch (error) {
      log("settings:init", "no settings found", error);
      await createSettings(DEFAULT_SETTINGS);
    }
  }

  function getSetting(key: keyof Omit<Settings, "id">) {
    return settings[key];
  }

  async function updateSettings(newSettings: Omit<Settings, "id">) {
    await _updateSettings(newSettings);
    settings = newSettings;
  }

  return {
    init,
    getSetting,
    getSettings,
    createSettings,
    updateSettings,
  };
}

export const actions: (keyof ReturnType<typeof settingsController>)[] = [
  "getSettings",
  "createSettings",
  "updateSettings",
];
