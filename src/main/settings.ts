import type { Settings } from "@/types/types";
import path from "node:path";
import settings from "electron-settings";
import { isEmpty } from "@/lib/utils";
import { readJSONSync } from "fs-extra";
import { log } from "./logger";

const { NODE_ENV, npm_lifecycle_event } = process.env;

const isDev =
  npm_lifecycle_event === "test:e2e" ||
  NODE_ENV == "development" ||
  NODE_ENV === "test";

export function initSettings() {
  settings.configure({
    dir: isDev ? path.join(process.cwd(), ".dev-settings") : undefined,
  });
  let currentSettings = settings.getSync();
  if (isEmpty(currentSettings)) {
    const settingsFileName = isDev ? "settings-dev.json" : "settings.json";
    currentSettings = readJSONSync(
      path.resolve(__dirname, "../../", settingsFileName)
    );
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
