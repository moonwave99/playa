import { Playlist } from '../../../interfaces';

export const LOAD_PLAYLIST   = 'playa/playlists/LOAD_PLAYLIST';
export const CREATE_PLAYLIST = 'playa/playlists/CREATE_PLAYLIST';
export const UPDATE_PLAYLIST = 'playa/playlists/UPDATE_PLAYLIST';
export const DELETE_PLAYLIST = 'playa/playlists/DELETE_PLAYLIST';

export interface PlaylistState {
  all: Array<Playlist>;
  recent: Array<Playlist>;
  current?: Playlist;
}

interface LoadPlaylistAction {
  type: typeof LOAD_PLAYLIST;
  playlist: Playlist;
}

interface CreatePlaylistAction {
  type: typeof CREATE_PLAYLIST;
  playlist: Playlist;
}

export type PlaylistActionTypes = LoadPlaylistAction | CreatePlaylistAction;

const INITIAL_STATE: PlaylistState = {
	all: [],
  recent: [],
  current: null
}

export const loadPlaylist = (playlist: Playlist): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: LOAD_PLAYLIST,
      playlist
    });
  }

let count = 0;

export const createPlaylist = (): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: CREATE_PLAYLIST,
      playlist: {
        _id: `${++count}`,
        title: `Playo ${count}`,
        albums: []
      }
    });
  }

export default function reducer(
  state: PlaylistState = INITIAL_STATE,
  action: PlaylistActionTypes
): PlaylistState {
	switch (action.type) {
    case LOAD_PLAYLIST:
      return {
        ...state,
        current: action.playlist
      }
    case CREATE_PLAYLIST:
      return {
        ...state,
        current: action.playlist,
        all: [...state.all, action.playlist]
      }
		default:
			return state;
	}
}
