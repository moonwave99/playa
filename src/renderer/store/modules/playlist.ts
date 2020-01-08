import { ipcRenderer as ipc } from 'electron';

export interface Playlist {
  _id: string;
  _rev?: string;
  title: string;
  created: string;
  accessed: string;
  albums: string[];
}

export type PlaylistHashMap = { [key: string]: Playlist };

export interface PlaylistState {
  allById: PlaylistHashMap;
}

export const PLAYLIST_REQUEST_ALL = 'playa/playlists/REQUEST_ALL';
export const PLAYLIST_LOAD_ALL    = 'playa/playlists/LOAD_ALL';
export const PLAYLIST_SAVE        = 'playa/playlists/SAVE';
export const PLAYLIST_UPDATE      = 'playa/playlists/UPDATE';
export const PLAYLIST_DELETE      = 'playa/playlists/DELETE';
export const PLAYLIST_REMOVE      = 'playa/playlists/REMOVE';

interface RequestAllPlaylistAction {
  type: typeof PLAYLIST_REQUEST_ALL;
}

interface LoadAllPlaylistAction {
  type: typeof PLAYLIST_LOAD_ALL;
  playlists: Playlist[];
}

interface SavePlaylistAction {
  type: typeof PLAYLIST_SAVE;
  playlist: Playlist;
}

interface UpdatePlaylistAction {
  type: typeof PLAYLIST_UPDATE;
  playlist: Playlist;
}

interface DeletePlaylistAction {
  type: typeof PLAYLIST_DELETE;
  playlist: Playlist;
}

interface RemovePlaylistAction {
  type: typeof PLAYLIST_REMOVE;
  playlist: Playlist;
}

export type PlaylistActionTypes =
    RequestAllPlaylistAction
  | LoadAllPlaylistAction
  | SavePlaylistAction
  | UpdatePlaylistAction
  | DeletePlaylistAction
  | RemovePlaylistAction;

export const requestAllPlaylists = (): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYLIST_REQUEST_ALL
    });
  }

export const loadAllPlaylists = (playlists: Playlist[]): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYLIST_LOAD_ALL,
      playlists,
    });
  }

export const savePlaylist = (playlist: Playlist): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYLIST_SAVE,
      playlist
    });
  }

export const updatePlaylist = (playlist: Playlist): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYLIST_UPDATE,
      playlist
    });
  }

export const deletePlaylist = (playlist: Playlist): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYLIST_DELETE,
      playlist
    });
  }

export const removePlaylist = (playlist: Playlist): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYLIST_REMOVE,
      playlist
    });
  }

function toObj(playlists: Playlist[]): PlaylistHashMap {
  return playlists.reduce((memo: PlaylistHashMap, p: Playlist) => {
    memo[p._id] = p;
    return memo;
  }, {});
}

function removeIds(playlistsById: PlaylistHashMap, ids: Playlist['_id'][]): PlaylistHashMap {
  return Object.keys(playlistsById)
    .filter((id) => !ids.includes(id))
    .reduce((memo: PlaylistHashMap, id) => {
      memo[id] = playlistsById[id];
      return memo;
    }, {});
}

const INITIAL_STATE: PlaylistState = {
	allById: {}
}

export default function reducer(
  state: PlaylistState = INITIAL_STATE,
  action: PlaylistActionTypes
): PlaylistState {
  switch (action.type) {
    case PLAYLIST_REQUEST_ALL:
      ipc.send('playlist:request-all');
      return state;
    case PLAYLIST_LOAD_ALL:
      return {
        ...state,
        allById: toObj(action.playlists)
      };
    case PLAYLIST_SAVE:
      ipc.send('playlist:save', action.playlist);
      return state;
    case PLAYLIST_UPDATE:
      state.allById[action.playlist._id] = action.playlist;
      return state;
    case PLAYLIST_DELETE:
      ipc.send('playlist:delete', action.playlist);
      return state;
    case PLAYLIST_REMOVE:
      return {
        ...state,
        allById: removeIds(state.allById, [action.playlist._id])
      };
    default:
      return state;
  }
}
