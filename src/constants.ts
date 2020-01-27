import * as os from 'os'

export const IS_MACOS = (os.platform() === "darwin");

export const DEFAULT_WIDTH = 1200;
export const DEFAULT_HEIGHT = 800;
export const MIN_WIDTH = 350;
export const MIN_HEIGHT = DEFAULT_HEIGHT / 2;

export const RECENT_PLAYLIST_COUNT = 10;

export const MUSIC_FILE_EXTENSIONS = ['mp3', 'm4a', 'flac', 'ogg'];

export enum SEARCH_URLS {
  DISCOGS = 'http://www.discogs.com/search?type=release&q=',
  RYM = 'https://rateyourmusic.com/search?searchtype=l&searchterm=',
  YOUTUBE = 'https://www.youtube.com/results?search_query='
}

export const COLORS = {
  MAIN_COLOR: '#9b4dca',
  SKELETON_COLOR: '#282828'
};

export const LIBRARY_GRID_COLUMN_COUNT = 5;
export const LIBRARY_LATEST_ALBUM_LIMIT = 20;
export const LIBRARY_LATEST_DAY_COUNT = 90;

export const FONTS = ['Fira Mono', 'Inter UI', 'Nunito'];

export const WAVEFORM_PEAKS_COUNT = 1000;

export const IPC_MESSAGES = {
  IPC_ERROR: 'error',
  IPC_UI_STATE_LOAD: 'ui:state:load',
  IPC_UI_STATE_UPDATE: 'ui:state:update',
  IPC_UI_NAVIGATE_TO: 'ui:navigate-to',
  IPC_UI_FOCUS_SEARCH: 'ui:focus-search',
  IPC_UI_TOGGLE_ALBUM_VIEW: 'ui:toggle-album-view',
  IPC_SYS_REVEAL_IN_FINDER: 'sys:reveal-in-finder',
  IPC_SYS_OPEN_URL: 'sys:open-url',
  IPC_PLAYLIST_GET_ALL_REQUEST : 'playlist:get-all:request',
  IPC_PLAYLIST_GET_ALL_RESPONSE : 'playlist:get-all:response',
  IPC_PLAYLIST_SAVE_REQUEST : 'playlist:save:request',
  IPC_PLAYLIST_SAVE_RESPONSE : 'playlist:save:response',
  IPC_PLAYLIST_SAVE_LIST_REQUEST : 'playlist:save-list:request',
  IPC_PLAYLIST_SAVE_LIST_RESPONSE : 'playlist:save-list:response',
  IPC_PLAYLIST_DELETE_REQUEST : 'playlist:delete:request',
  IPC_PLAYLIST_DELETE_RESPONSE : 'playlist:delete:response',
  IPC_ALBUM_SAVE_REQUEST : 'album:save:request',
  IPC_ALBUM_SAVE_RESPONSE : 'album:save:response',
  IPC_ALBUM_DELETE_LIST_REQUEST : 'album:delete-list:request',
  IPC_ALBUM_DELETE_LIST_RESPONSE : 'album:delete-list:response',
  IPC_ALBUM_GET_LIST_REQUEST : 'album:get-list:request',
  IPC_ALBUM_GET_LIST_RESPONSE : 'album:get-list:response',
  IPC_ALBUM_CONTENT_REQUEST : 'album:content:request',
  IPC_ALBUM_CONTENT_RESPONSE : 'album:content:response',
  IPC_ALBUM_GET_LATEST_REQUEST : 'album:get-latest:request',
  IPC_ALBUM_GET_LATEST_RESPONSE : 'album:get-latest:response',
  IPC_TRACK_GET_LIST_REQUEST : 'track:get-list:request',
  IPC_TRACK_GET_LIST_RESPONSE : 'track:get-list:response',
  IPC_SEARCH_REQUEST : 'search:request',
  IPC_SEARCH_RESPONSE : 'search:response',
  IPC_COVER_GET_REQUEST: 'cover:get:request',
  IPC_COVER_GET_RESPONSE: 'cover:get:response',
  IPC_WAVEFORM_SAVE_REQUEST: 'waveform:save:request',
  IPC_WAVEFORM_GET_BASE_PATH: 'waveform:get-base-path',
  IPC_DIALOG_SHOW_MESSAGE: 'dialog:show-message',
  IPC_DIALOG_SELECT_FOLDER: 'dialog:select-folder',
  IPC_ALBUM_EXISTS: 'album:exists',
  IPC_ALBUM_GET_SINGLE_INFO: 'album:get-single:info',
  IPC_ALBUM_CONTENT_RAW_REQUEST: 'album:content:raw-request',
  IPC_TRACK_GET_LIST_RAW_REQUEST: 'track:get-list:raw-request'
};
