import type { Settings } from "@/types/types";
import settings from "electron-settings";
import { isEmpty } from "@/lib/utils";
import { readJSONSync } from "fs-extra";
import { log } from "./logger";

export function initSettings() {
  let currentSettings = settings.getSync();
  if (isEmpty(currentSettings)) {
    currentSettings = readJSONSync("../../settings.json");
    settings.setSync(currentSettings);
  }
  log("settings:initSettings", currentSettings);
}

export function getSetting(key: string) {
  const value = settings.getSync(key);
  if (typeof value === "undefined") {
    throw new Error(`Cannot find ${key} in settings`);
  }
  return value;
}

export function getSettings() {
  return settings.getSync() as Settings;
}

export function setSettings(newSettings: Settings) {
  return settings.setSync(newSettings);
}
