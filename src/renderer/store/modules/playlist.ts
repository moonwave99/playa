import { ipcRenderer as ipc } from 'electron';
import {
  EntityHashMap,
  toObj,
  removeIds,
  ensureAll,
  updateId
} from '../../utils/storeUtils';

import { Album } from './album';

import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_PLAYLIST_GET_ALL_REQUEST,
  IPC_PLAYLIST_SAVE_REQUEST,
  IPC_PLAYLIST_DELETE_REQUEST
} = IPC_MESSAGES;

export interface Playlist {
  _id: string;
  _rev?: string;
  title: string;
  created: string;
  accessed: string;
  albums: Album['_id'][];
}

export interface PlaylistState {
  allById: EntityHashMap<Playlist>;
}

export function getDefaultPlaylist(): Playlist {
  const now = new Date().toISOString();
  return {
    _id: now,
    _rev: null,
    title: 'New Playlist',
    created: now,
    accessed: now,
    albums: []
  };
}

export const PLAYLIST_GET_ALL_REQUEST   = 'playa/playlists/GET_ALL_REQUEST';
export const PLAYLIST_GET_ALL_RESPONSE  = 'playa/playlists/GET_ALL_RESPONSE';
export const PLAYLIST_GET_LIST_REQUEST  = 'playa/playlists/GET_LIST_REQUEST';
export const PLAYLIST_GET_LIST_RESPONSE = 'playa/playlists/GET_LIST_RESPONSE';
export const PLAYLIST_SAVE_REQUEST      = 'playa/playlists/SAVE_REQUEST';
export const PLAYLIST_SAVE_RESPONSE     = 'playa/playlists/SAVE_RESPONSE';
export const PLAYLIST_DELETE_REQUEST    = 'playa/playlists/DELETE_REQUEST';
export const PLAYLIST_DELETE_RESPONSE   = 'playa/playlists/DELETE_RESPONSE';

interface GetAllPlaylistRequestAction {
  type: typeof PLAYLIST_GET_ALL_REQUEST;
}

interface GetAllPlaylistResponseAction {
  type: typeof PLAYLIST_GET_ALL_RESPONSE;
  playlists: Playlist[];
}

interface GetListPlaylistResponseAction {
  type: typeof PLAYLIST_GET_LIST_RESPONSE;
  playlists: Playlist[];
}

interface SavePlaylistRequestAction {
  type: typeof PLAYLIST_SAVE_REQUEST;
  playlist: Playlist;
}

interface SavePlaylistResponseAction {
  type: typeof PLAYLIST_SAVE_RESPONSE;
  playlist: Playlist;
}

interface DeletePlaylistRequestAction {
  type: typeof PLAYLIST_DELETE_REQUEST;
  playlist: Playlist;
}

interface DeletePlaylistResponseAction {
  type: typeof PLAYLIST_DELETE_RESPONSE;
  playlist: Playlist;
}

export type PlaylistActionTypes =
    GetAllPlaylistRequestAction
  | GetAllPlaylistResponseAction
  | GetListPlaylistResponseAction
  | SavePlaylistRequestAction
  | SavePlaylistResponseAction
  | DeletePlaylistRequestAction
  | DeletePlaylistResponseAction;

export const getAllPlaylistsRequest = (): Function =>
  async (dispatch: Function): Promise<void> => {
    const playlists = await ipc.invoke(IPC_PLAYLIST_GET_ALL_REQUEST);
    dispatch({
      type: PLAYLIST_GET_ALL_RESPONSE,
      playlists
    });
  }

export const savePlaylistRequest = (playlist: Playlist): Function =>
  async (dispatch: Function): Promise<void> => {
    const savedPlaylist = await ipc.invoke(IPC_PLAYLIST_SAVE_REQUEST, playlist);
    dispatch({
      type: PLAYLIST_SAVE_RESPONSE,
      playlist: savedPlaylist
    });
  }

export const deletePlaylistRequest = (playlist: Playlist): Function =>
  async (dispatch: Function): Promise<void> => {
    const deletedPlaylist = await ipc.invoke(IPC_PLAYLIST_DELETE_REQUEST, playlist);
    dispatch({
      type: PLAYLIST_DELETE_RESPONSE,
      playlist: deletedPlaylist
    });
  }

const INITIAL_STATE: PlaylistState = {
	allById: {}
}

export default function reducer(
  state: PlaylistState = INITIAL_STATE,
  action: PlaylistActionTypes
): PlaylistState {
  switch (action.type) {
    case PLAYLIST_GET_ALL_RESPONSE:
      return {
        ...state,
        allById: toObj(ensureAll<Playlist>(action.playlists, getDefaultPlaylist))
      };
    case PLAYLIST_GET_LIST_RESPONSE:
      return {
        ...state,
        allById: {
          ...state.allById,
          ...toObj(ensureAll<Playlist>(action.playlists, getDefaultPlaylist))
        }
      };
    case PLAYLIST_SAVE_RESPONSE:
      return {
        ...state,
        allById: updateId(state.allById, action.playlist._id, action.playlist)
      };
    case PLAYLIST_DELETE_RESPONSE:
      return {
        ...state,
        allById: removeIds(state.allById, [action.playlist._id])
      };
    case PLAYLIST_GET_ALL_REQUEST:
    case PLAYLIST_SAVE_REQUEST:
    case PLAYLIST_DELETE_REQUEST:
    default:
      return state;
  }
}
