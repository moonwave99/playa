import * as os from 'os'

export const IS_MACOS = (os.platform() === 'darwin');

export const DEFAULT_WIDTH = 1200;
export const DEFAULT_HEIGHT = 800;
export const MIN_WIDTH = 400;
export const MIN_HEIGHT = DEFAULT_HEIGHT / 2;

export const TRAFFIC_LIGHTS_POSITION = {
  x: 15,
  y: 45
};

export const ABOUT_WINDOW_WIDTH = 600;
export const ABOUT_WINDOW_HEIGHT = 350;

export const RECENT_PLAYLIST_COUNT = 20;

export const MUSIC_FILE_EXTENSIONS = ['mp3', 'm4a', 'flac', 'ogg'];

export const COVER_WIDTH = 200;
export const COVER_JPEG_QUALITY = 80;

export enum SEARCH_URLS {
  DISCOGS = 'http://www.discogs.com/search?type=release&q=',
  RYM = 'https://rateyourmusic.com/search?searchtype=l&searchterm=',
  RYM_ARTIST = 'https://rateyourmusic.com/search?searchtype=a&searchterm=',
  YOUTUBE = 'https://www.youtube.com/results?search_query='
}

export const COLORS = {
  MAIN_COLOR: '#9b4dca',
  SKELETON_COLOR: '#282828',
  BACKGROUND_COLOR: '#1F1F1F'
};

export const LIBRARY_LATEST_ALBUM_LIMIT = 14;
export const LIBRARY_LATEST_DAY_COUNT = 90;

export const DATE_FORMATS = {
  DEFAULT: { year: 'numeric', month: 'long', day: 'numeric' },
  SHORT: { year: 'numeric', month: 'numeric', day: 'numeric' }
};

export const ALBUM_GRID_THRESHOLDS = [
  {
    width: 1400,
    columns: 7
  },
  {
    width: 1200,
    columns: 6
  },
  {
    width: 1000,
    columns: 5
  },
  {
    width: 800,
    columns: 4
  },
  {
    width: 600,
    columns: 3
  },
  {
    width: 400,
    columns: 2
  }
];

export const ALBUM_GRID_TOOLTIP_DELAY_SHOW = 500;
export const ALBUM_GRID_TOOLTIP_DELAY_HIDE = 200;

export const FONTS = ['Fira Mono', 'Inter UI', 'Nunito'];

export const WAVEFORM_RESOLUTION = 1000;
export const WAVEFORM_PRECISION = 2;

export const IPC_MESSAGES = {
  IPC_ERROR: 'error',
  IPC_UI_STATE_LOAD: 'ui:state:load',
  IPC_UI_STATE_UPDATE: 'ui:state:update',
  IPC_UI_NAVIGATE_TO: 'ui:navigate-to',
  IPC_UI_FOCUS_SEARCH: 'ui:focus-search',
  IPC_UI_SWIPE: 'ui:swipe',
  IPC_UI_LOCATION_UPDATE: 'ui:location-update',
  IPC_UI_EDIT_PLAYLIST_TITLE: 'ui:edit-playlist-title',
  IPC_UI_EDIT_ARTIST_TITLE: 'ui:edit-artist-title',
  IPC_UI_LIBRARY_ALBUM_SELECTION_UPDATE: 'ui:library-album-selection-update',
  IPC_UI_PLAYLIST_ALBUM_SELECTION_UPDATE: 'ui:playlist-album-selection-update',
  IPC_UI_PLAYLIST_LIST_SELECTION_UPDATE: 'ui:playlist-list-selection-update',
  IPC_UI_REMOVE_PLAYLISTS: 'ui:remove-playlists',
  IPC_UI_MENU_REMOTE_CALL: 'ui:menu-remote-call',
  IPC_PLAYBACK_PREV_TRACK: 'ui:playback:prev-track',
  IPC_PLAYBACK_NEXT_TRACK: 'ui:playback:next-track',
  IPC_PLAYBACK_CLEAR_QUEUE: 'ui:playback:clear-queue',
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
  IPC_PLAYLIST_DELETE_LIST_REQUEST : 'playlist:delete-list:request',
  IPC_PLAYLIST_DELETE_LIST_RESPONSE : 'playlist:delete-list:response',
  IPC_PLAYLIST_REMOVE_ALBUMS : 'playlist:remove-albums',
  IPC_ALBUM_SAVE_REQUEST : 'album:save:request',
  IPC_ALBUM_SAVE_RESPONSE : 'album:save:response',
  IPC_ALBUM_DELETE_LIST_REQUEST : 'album:delete-list:request',
  IPC_ALBUM_DELETE_LIST_RESPONSE : 'album:delete-list:response',
  IPC_ALBUM_GET_LIST_REQUEST : 'album:get-list:request',
  IPC_ALBUM_GET_LIST_RESPONSE : 'album:get-list:response',
  IPC_ALBUM_FIND_REQUEST : 'album:find:response',
  IPC_ALBUM_FIND_RESPONSE : 'album:find:response',
  IPC_ALBUM_CONTENT_REQUEST : 'album:content:request',
  IPC_ALBUM_CONTENT_RESPONSE : 'album:content:response',
  IPC_ALBUM_GET_LATEST_REQUEST : 'album:get-latest:request',
  IPC_ALBUM_GET_LATEST_RESPONSE : 'album:get-latest:response',
  IPC_ALBUM_GET_STATS_REQUEST : 'album:get-stats:request',
  IPC_ALBUM_GET_STATS_RESPONSE : 'album:get-stats:response',
  IPC_ARTIST_GET_ALL_REQUEST : 'artist:get-all-request',
  IPC_ARTIST_SAVE_REQUEST : 'artist:save-request',
  IPC_ARTIST_SAVE_LIST_REQUEST : 'artist:save-list-request',
  IPC_ARTIST_DELETE_REQUEST : 'artist:delete-request',
  IPC_TRACK_GET_LIST_REQUEST : 'track:get-list:request',
  IPC_TRACK_GET_LIST_RESPONSE : 'track:get-list:response',
  IPC_TRACK_DELETE_LIST_REQUEST : 'track:delete-list:request',
  IPC_TRACK_DELETE_LIST_RESPONSE : 'track:delete-list:response',
  IPC_SEARCH_REQUEST : 'search:request',
  IPC_SEARCH_RESPONSE : 'search:response',
  IPC_COVER_GET_FROM_URL_REQUEST: 'cover:get-from-url:request',
  IPC_COVER_GET_FROM_URL_RESPONSE: 'cover:get-from-url:response',
  IPC_COVER_GET_REQUEST: 'cover:get:request',
  IPC_COVER_GET_RESPONSE: 'cover:get:response',
  IPC_ARTIST_PICTURE_GET_FROM_URL_REQUEST: 'artistPicture:get-from-url:request',
  IPC_ARTIST_PICTURE_GET_FROM_URL_RESPONSE: 'artistPicture:get-from-url:response',
  IPC_ARTIST_PICTURE_GET_REQUEST: 'artistPicture:get:request',
  IPC_ARTIST_PICTURE_GET_RESPONSE: 'artistPicture:get:response',
  IPC_WAVEFORM_SAVE_REQUEST: 'waveform:save:request',
  IPC_WAVEFORM_GET_BASE_PATH: 'waveform:get-base-path',
  IPC_DIALOG_SHOW_MESSAGE: 'dialog:show-message',
  IPC_DIALOG_SELECT_FOLDER: 'dialog:select-folder',
  IPC_ALBUM_EXISTS: 'album:exists',
  IPC_ALBUM_GET_SINGLE_INFO: 'album:get-single:info',
  IPC_ALBUM_CONTENT_RAW_REQUEST: 'album:content:raw-request',
  IPC_TRACK_GET_LIST_RAW_REQUEST: 'track:get-list:raw-request',
  IPC_ABOUT_CLOSE_WINDOW: 'about:close-window',
  IPC_ABOUT_OPEN_LINK: 'about:open-link',
  IPC_LIBRARY_IMPORT_MUSIC: 'library:import-music',
  IPC_LIBRARY_EDIT_ALBUM: 'library:edit-album',
  IPC_LIBRARY_ADD_ALBUMS_TO_PLAYLIST: 'library:add-albums-to-playlist',
  IPC_LIBRARY_REMOVE_ALBUMS: 'library:remove-albums',
  IPC_LIBRARY_REVEAL_ALBUM: 'library:reveal-album'
};
