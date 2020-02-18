import { ipcRenderer as ipc } from 'electron';
import { createSelector } from 'reselect';
import { ensureAll } from '../../utils/storeUtils';

import { ApplicationState } from '../store';

import {
  Album,
  getDefaultAlbum,
  ALBUM_GET_LIST_RESPONSE
} from './album';

import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_SEARCH_REQUEST,
} = IPC_MESSAGES;

export interface SearchState {
  results: Album[];
  isSearching: boolean;
}

export const searchSelector = createSelector(
  (state: ApplicationState): SearchState => state.search,
  (search: SearchState) => search
);

export const SEARCH_REQUEST  = 'playa/search/SEARCH_REQUEST';
export const SEARCH_RESPONSE = 'playa/search/SEARCH_RESPONSE';

interface SearchRequestAction {
  type: typeof SEARCH_REQUEST;
  query: string;
}

interface SearchResponseAction {
  type: typeof SEARCH_RESPONSE;
  results: Album[];
  query: string;
}

export type SearchActionTypes =
    SearchRequestAction
  | SearchResponseAction;

export const searchRequest = (query: string): Function =>
  async (dispatch: Function): Promise<void> => {
    dispatch({
      type: SEARCH_REQUEST,
      query
    });
    const results = await ipc.invoke(IPC_SEARCH_REQUEST, query);
    dispatch({
      type: ALBUM_GET_LIST_RESPONSE,
      results
    });
    dispatch({
      type: SEARCH_RESPONSE,
      results,
      query
    });
  }

const INITIAL_STATE = {
  results: [] as Album[],
  isSearching: false
};

export default function reducer(
  state: SearchState = INITIAL_STATE,
  action: SearchActionTypes
): SearchState {
  switch (action.type) {
    case SEARCH_REQUEST:
      return {
        results: [],
        isSearching: true
      };
    case SEARCH_RESPONSE:
      return {
        results: ensureAll<Album>(action.results, getDefaultAlbum),
        isSearching: false
      };
		default:
			return state;
  }
}
