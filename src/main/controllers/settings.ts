import type { Settings } from "@/types/types";
import {
  getSettings,
  createSettings,
  updateSettings as _updateSettings,
} from "../db/settings";

import { DEFAULT_SETTINGS } from "@/constants";

import { log } from "../logger";

export type GetSetting = (key: keyof Omit<Settings, "id">) => unknown;

export function settingsController() {
  let settings: Omit<Settings, "id"> = null;

  async function init() {
    try {
      settings = await getSettings();
    } catch {
      log("settings:init", "no settings found");
      settings = await createSettings(DEFAULT_SETTINGS);
    }
  }

  function getSetting(key: keyof Omit<Settings, "id">) {
    return settings[key];
  }

  async function updateSettings(newSettings: Omit<Settings, "id">) {
    await _updateSettings(newSettings);
    settings = newSettings;
    return settings;
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
