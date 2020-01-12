import * as os from 'os'

export const MACOS = (os.platform() === "darwin");

export const HEIGHT = 800;
export const WIDTH = 1200;

export const MUSIC_ROOT_FOLDER = '/Volumes/Public/Music';
export const MUSIC_FILE_EXTENSIONS = ['mp3', 'm4a', 'flac', 'ogg'];

export const IPC_MESSAGES = {
  IPC_UI_SEARCH_SHOW: 'ui:search:show',
  IPC_UI_START_ALBUM_DRAG: 'ui:start-album-drag',
  IPC_SYS_REVEAL_IN_FINDER: 'sys:reveal-in-finder',
  IPC_PLAYLIST_GET_ALL_REQUEST : 'playlist:get-all:request',
  IPC_PLAYLIST_GET_ALL_RESPONSE : 'playlist:get-all:response',
  IPC_PLAYLIST_SAVE_REQUEST : 'playlist:save:request',
  IPC_PLAYLIST_SAVE_RESPONSE : 'playlist:save:response',
  IPC_PLAYLIST_DELETE_REQUEST : 'playlist:delete:request',
  IPC_PLAYLIST_DELETE_RESPONSE : 'playlist:delete:response',
  IPC_ALBUM_SEARCH_REQUEST : 'album:search:request',
  IPC_ALBUM_SEARCH_RESPONSE : 'album:search:response',
  IPC_ALBUM_GET_LIST_REQUEST : 'album:get-list:request',
  IPC_ALBUM_GET_LIST_RESPONSE : 'album:get-list:response',
  IPC_ALBUM_CONTENT_REQUEST : 'album:content:request',
  IPC_ALBUM_CONTENT_RESPONSE : 'album:content:response',
  IPC_TRACK_GET_LIST_REQUEST : 'track:get-list:request',
  IPC_TRACK_GET_LIST_RESPONSE : 'track:get-list:response',
  IPC_COVER_GET_REQUEST: 'cover:get:request',
  IPC_COVER_GET_RESPONSE: 'cover:get:response',
};

export const COLORS = {
  SKELETON_COLOR: '#282828'
};
