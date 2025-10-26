import type { Settings } from "./types/types";

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  PLAYER_PATH: "",
  TAGGER_PATH: "",
  DISCOGS_KEY: "",
  DISCOGS_SECRET: "",
  LIBRARY_PATH: "",
  COVERS_PATH: "",
  USE_SMART_IMPORT: false,
  SHOW_ONBOARDING_ON_STARTUP: true,
};

export const MAX_IMPORT_FOLDERS = 10;

export const ON_IMPORT_DONE_DELAY = 5000;
export const ON_EXPORT_DONE_DELAY = 3000;

export const HOMEPAGE_RELEASES_PAGESIZE = 10;
export const HOMEPAGE_ENTRIES_PAGESIZE = 5;
