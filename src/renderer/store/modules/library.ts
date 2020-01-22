import { ipcRenderer as ipc } from 'electron';
import { ensureAll } from '../../utils/storeUtils';
import {
  Album,
  getDefaultAlbum,
  ALBUM_GET_LIST_RESPONSE
} from './album';

import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_ALBUM_GET_LATEST_REQUEST,
} = IPC_MESSAGES;

export interface LibraryState {
  latest: Album[];
}

export const LIBRARY_GET_LATEST_REQUEST  = 'playa/library/GET_LATEST_REQUEST';
export const LIBRARY_GET_LATEST_RESPONSE = 'playa/library/GET_LATEST_RESPONSE';

interface LibraryGetLatestRequestAction {
  type: typeof LIBRARY_GET_LATEST_REQUEST;
}

interface LibraryGetLatestResponseAction {
  type: typeof LIBRARY_GET_LATEST_RESPONSE;
  results: Album[];
}

export type LibraryActionTypes =
    LibraryGetLatestRequestAction
  | LibraryGetLatestResponseAction;

export const getLatestRequest = (dateFrom = new Date().toISOString(), limit = 20): Function =>
  async (dispatch: Function): Promise<void> => {
    const results = await ipc.invoke(IPC_ALBUM_GET_LATEST_REQUEST, dateFrom, limit);
    dispatch({
      type: ALBUM_GET_LIST_RESPONSE,
      results
    });
    dispatch({
      type: LIBRARY_GET_LATEST_RESPONSE,
      results
    });
  }

const INITIAL_STATE = {
  latest: [] as Album[]
};

export default function reducer(
  state: LibraryState = INITIAL_STATE,
  action: LibraryActionTypes
): LibraryState {
  switch (action.type) {
    case LIBRARY_GET_LATEST_RESPONSE:
      return {
        latest: ensureAll<Album>(action.results, getDefaultAlbum),
      };
    case LIBRARY_GET_LATEST_REQUEST:
		default:
			return state;
  }
}
