import { ipcRenderer as ipc } from 'electron';

export const VARIOUS_ARTISTS_ID = '_various-artists';

export interface Album {
  _id: string;
  artist: string;
  title: string;
  year?: number;
  type: string;
  created: Date;
  path: string;
  tracks: Track[];
}

export interface Track {
  path: string;
  artist: string;
  title: string;
  duration: number;
}

export interface AlbumState {
  searchResults: Album[];
  currentList: Album[];
}

export const ALBUM_SEARCH_REQUEST    = 'playa/album/SEARCH_REQUEST';
export const ALBUM_SEARCH_RESPONSE   = 'playa/album/SEARCH_RESPONSE';
export const ALBUM_GET_LIST_REQUEST  = 'playa/album/LOAD_LIST_REQUEST';
export const ALBUM_GET_LIST_RESPONSE = 'playa/album/LOAD_LIST_RESPONSE';

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

export type AlbumActionTypes =
    SearchAlbumRequestAction
  | SearchAlbumResponseAction
  | GetAlbumListRequestAction
  | GetAlbumListResponseAction;

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

const INITIAL_STATE = {
  searchResults: [] as Album[],
  currentList: [] as Album[]
};

export default function reducer(
  state: AlbumState = INITIAL_STATE,
  action: AlbumActionTypes
): AlbumState {
  switch (action.type) {
    case ALBUM_SEARCH_REQUEST:
      ipc.send('album:search:request', action.query);
      return state;
    case ALBUM_SEARCH_RESPONSE:
      return {
        ...state,
        searchResults: action.results
      };
    case ALBUM_GET_LIST_REQUEST:
      ipc.send('album:get-list:request', action.ids);
      return state;
    case ALBUM_GET_LIST_RESPONSE:
      return {
        ...state,
        currentList: action.results
      };
		default:
			return state;
  }
}
