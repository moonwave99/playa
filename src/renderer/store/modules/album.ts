import { ipcRenderer as ipc } from 'electron';
import { EntityHashMap, toObj, ensureAll } from '../../utils/store';

import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_ALBUM_SEARCH_REQUEST,
  IPC_ALBUM_GET_LIST_REQUEST,
  IPC_ALBUM_CONTENT_REQUEST
} = IPC_MESSAGES;

export const VARIOUS_ARTISTS_ID = '_various-artists';

export interface Album {
  _id: string;
  artist: string;
  title: string;
  year?: number;
  type: string;
  created: string;
  path: string;
  tracks: string[];
}

export function getDefaultAlbum(): Album {
  const now = new Date().toISOString();
  return {
    _id: null,
    artist: '',
    title: '',
    type: 'album',
    created: now,
    path: '',
    tracks: []
  };
}

export interface AlbumState {
  searchResults: Album[];
  allById: EntityHashMap<Album>;
}

export const ALBUM_SEARCH_REQUEST       = 'playa/album/SEARCH_REQUEST';
export const ALBUM_SEARCH_RESPONSE      = 'playa/album/SEARCH_RESPONSE';
export const ALBUM_GET_LIST_REQUEST     = 'playa/album/GET_LIST_REQUEST';
export const ALBUM_GET_LIST_RESPONSE    = 'playa/album/GET_LIST_RESPONSE';
export const ALBUM_GET_CONTENT_REQUEST  = 'playa/album/GET_CONTENT_REQUEST';
export const ALBUM_GET_CONTENT_RESPONSE = 'playa/album/GET_CONTENT_RESPONSE';

interface SearchAlbumRequestAction {
  type: typeof ALBUM_SEARCH_REQUEST;
  query: string;
}

interface SearchAlbumResponseAction {
  type: typeof ALBUM_SEARCH_RESPONSE;
  results: Album[];
}

interface GetAlbumListRequestAction {
  type: typeof ALBUM_GET_LIST_REQUEST;
  ids: string[];
}

interface GetAlbumListResponseAction {
  type: typeof ALBUM_GET_LIST_RESPONSE;
  results: Album[];
}

interface GetAlbumContentRequestAction {
  type: typeof ALBUM_GET_CONTENT_REQUEST;
  album: Album;
}

interface GetAlbumContentResponseAction {
  type: typeof ALBUM_GET_CONTENT_RESPONSE;
  album: Album;
}

export type AlbumActionTypes =
    SearchAlbumRequestAction
  | SearchAlbumResponseAction
  | GetAlbumListRequestAction
  | GetAlbumListResponseAction
  | GetAlbumContentRequestAction
  | GetAlbumContentResponseAction;

export const searchAlbumsRequest = (query: string): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_SEARCH_REQUEST,
      query
    });
  }

export const searchAlbumsResponse = (results: Album[]): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_SEARCH_RESPONSE,
      results
    });
  }

export const getAlbumListRequest = (ids: string[]): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_GET_LIST_REQUEST,
      ids
    });
  }

export const getAlbumListResponse = (results: Album[]): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_GET_LIST_RESPONSE,
      results
    });
  }

export const getAlbumContentRequest = (album: Album): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_GET_CONTENT_REQUEST,
      album
    });
  }

export const getAlbumContentResponse = (album: Album): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_GET_CONTENT_RESPONSE,
      album
    });
  }

const INITIAL_STATE = {
  searchResults: [] as Album[],
  allById: {}
};

export default function reducer(
  state: AlbumState = INITIAL_STATE,
  action: AlbumActionTypes
): AlbumState {
  switch (action.type) {
    case ALBUM_SEARCH_REQUEST:
      ipc.send(IPC_ALBUM_SEARCH_REQUEST, action.query);
      return state;
    case ALBUM_SEARCH_RESPONSE:
      return {
        ...state,
        searchResults: action.results
      };
    case ALBUM_GET_LIST_REQUEST:
      ipc.send(IPC_ALBUM_GET_LIST_REQUEST, action.ids);
      return state;
    case ALBUM_GET_LIST_RESPONSE:
      return {
        ...state,
        allById: {...state.allById, ...toObj(ensureAll<Album>(action.results, getDefaultAlbum)) }
      };
    case ALBUM_GET_CONTENT_REQUEST:
      ipc.send(IPC_ALBUM_CONTENT_REQUEST, action.album);
      return state;
    case ALBUM_GET_CONTENT_RESPONSE:
      state.allById[action.album._id] = action.album;
      return state;
		default:
			return state;
  }
}
