import type { ReleaseType, Settings } from "./types/types";

export const MIN_WINDOW_WIDTH = 450;
export const MIN_WINDOW_HEIGHT = 640;

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  PLAYER_PATH: "",
  TAGGER_PATH: "",
  DISCOGS_KEY: "",
  DISCOGS_SECRET: "",
  LIBRARY_PATH: "",
  COVERS_PATH: "",
  SHOW_ONBOARDING_ON_STARTUP: true,
  USE_RAINBOW_MODE: true,
};

export const MAX_IMPORT_FOLDERS = 10;

export const ON_IMPORT_DONE_DELAY = 5000;
export const ON_EXPORT_DONE_DELAY = 3000;

export const MODAL_CLOSE_TIMEOUT = 300;
export const DEBOUNCE_INTERVAL = 200;
export const NOTIFICATION_AUTOCLOSE_INTERVAL = 1500;

export const HOMEPAGE_RELEASES_PAGESIZE = 10;
export const HOMEPAGE_ENTRIES_PAGESIZE = 5;

export const EMPTY_IMG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export const HOVER_DELAY = 750;
export const HOVER_TIMEOUT = 200;

export const DOWNLOAD_COVERS_THROTTLE_INTERVAL = 500;

export const DEFAULT_RELEASE_YEAR = 1999;
export const DEFAULT_RELEASE_TYPE = "Album" as ReleaseType;

export const MAX_ONBOARDING_IMPORT_RELEASE_COUNT = 3;

export const VARIOUS_ARTISTS_NAME = "__VV_AA__";

export const VARIOUS_ARTIST_POSSIBLE_FOLDERS = [
  "V:A",
  "Various Artists",
  "AA. VV.",
  "VV. AA.",
];

export const DEFAULT_LOOKUP_PAGE_SIZE = 25;
