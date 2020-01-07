import { ipcRenderer as ipc } from 'electron';

export interface Album {
  _id: string;
  artist: string;
  title: string;
  year?: number;
  type: string;
  created: Date;
  path: string;
}

export interface AlbumState {
  searchResults: Album[];
}

export const ALBUM_SEARCH_REQUEST = 'playa/album/SEARCH_REQUEST';
export const ALBUM_SEARCH_RESULTS = 'playa/album/SEARCH_RESULTS';

interface SearchAlbumRequestAction {
  type: typeof ALBUM_SEARCH_REQUEST;
  query: string;
}

interface SearchAlbumResultsAction {
  type: typeof ALBUM_SEARCH_RESULTS;
  results: Album[];
}

export type AlbumActionTypes =
    SearchAlbumRequestAction
  | SearchAlbumResultsAction;

export const searchAlbumsRequest = (query: string): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_SEARCH_REQUEST,
      query
    });
  }

export const searchAlbumsResults = (results: Album[]): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_SEARCH_RESULTS,
      results
    });
  }

const INITIAL_STATE = {
  searchResults: [] as Album[]
};

export default function reducer(
  state: AlbumState = INITIAL_STATE,
  action: AlbumActionTypes
): AlbumState {
  switch (action.type) {
    case ALBUM_SEARCH_REQUEST:
      ipc.send('album:search:request', action.query)
      return state;
    case ALBUM_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.results
      };
		default:
			return state;
  }
}
