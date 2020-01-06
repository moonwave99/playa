import { ipcRenderer as ipc } from 'electron';

export type PlaylistHashMap = { [key: string]: Playlist };

export interface Playlist {
  _id: string;
  _rev?: string;
  title: string;
  created: string;
  accessed: string;
  albums: string[];
}

export const PLAYLIST_REQUEST_ALL = 'playa/playlists/REQUEST_ALL';
export const PLAYLIST_LOAD_ALL    = 'playa/playlists/LOAD_ALL';
export const PLAYLIST_LOAD        = 'playa/playlists/LOAD';
export const PLAYLIST_SAVE        = 'playa/playlists/SAVE';
export const PLAYLIST_UPDATE      = 'playa/playlists/UPDATE';
export const PLAYLIST_DELETE      = 'playa/playlists/DELETE';
export const PLAYLIST_REMOVE      = 'playa/playlists/REMOVE';

export interface PlaylistState {
  allById: PlaylistHashMap;
  recent: Array<Playlist>;
  current?: Playlist;
}

interface RequestAllPlaylistAction {
  type: typeof PLAYLIST_REQUEST_ALL;
  playlists: Playlist[];
}

interface LoadAllPlaylistAction {
  type: typeof PLAYLIST_LOAD_ALL;
  playlists: Playlist[];
}

interface LoadPlaylistAction {
  type: typeof PLAYLIST_LOAD;
  id: Playlist['_id'];
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
  | LoadPlaylistAction
  | SavePlaylistAction
  | UpdatePlaylistAction
  | DeletePlaylistAction
  | RemovePlaylistAction;

const INITIAL_STATE: PlaylistState = {
	allById: {},
  recent: [],
  current: null
}

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

export const loadPlaylist = (id: Playlist['_id']): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: PLAYLIST_LOAD,
      id,
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
    .filter((id) => ids.indexOf(id) === -1)
    .reduce((memo: PlaylistHashMap, id) => {
      memo[id] = playlistsById[id];
      return memo;
    }, {});
}

export default function reducer(
  state: PlaylistState = INITIAL_STATE,
  action: PlaylistActionTypes
): PlaylistState {
  switch (action.type) {
    case PLAYLIST_DELETE:
      ipc.send('playlist:delete', action.playlist);
      return state;
    case PLAYLIST_REMOVE:
      return {
        ...state,
        allById: removeIds(state.allById, [action.playlist._id]),
        current: state.current._id === action.playlist._id ? null : state.current
      };
    case PLAYLIST_SAVE:
      ipc.send('playlist:save', action.playlist);
      return state;
    case PLAYLIST_UPDATE:
      state.allById[action.playlist._id] = action.playlist;
      return {
        ...state,
        current: action.playlist
      };
    case PLAYLIST_REQUEST_ALL:
      ipc.send('playlist:request-all');
      return state;
    case PLAYLIST_LOAD_ALL:
      return {
        ...state,
        allById: toObj(action.playlists)
      };
    case PLAYLIST_LOAD:
      return {
        ...state,
        current: state.allById[action.id] || state.current
      }
    default:
      return state;
  }
}
