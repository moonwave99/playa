import { ipcRenderer as ipc } from 'electron';

export interface Track {
  path: string;
  artist: string;
  title: string;
  duration: number;
}

export type TrackHashMap = { [key: string]: Track[] };

export interface TrackState {
  allByAlbumId: TrackHashMap;
}

export const TRACK_GET_LIST_REQUEST  = 'playa/track/LOAD_LIST_REQUEST';
export const TRACK_GET_LIST_RESPONSE = 'playa/track/LOAD_LIST_RESPONSE';


interface GetTrackListRequestAction {
  type: typeof TRACK_GET_LIST_REQUEST;
  ids: string[];
  albumId: string;
}

interface GetTrackListResponseAction {
  type: typeof TRACK_GET_LIST_RESPONSE;
  results: Track[];
  albumId: string;
}

export type TrackActionTypes =
    GetTrackListRequestAction
  | GetTrackListResponseAction;

export const getTrackListRequest = (ids: string[], albumId: string): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: TRACK_GET_LIST_REQUEST,
      ids,
      albumId
    });
  }

export const getTrackListResponse = (results: Track[], albumId: string): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: TRACK_GET_LIST_RESPONSE,
      results,
      albumId
    });
  }

const INITIAL_STATE = {
  allByAlbumId: {}
};

export default function reducer(
  state: TrackState = INITIAL_STATE,
  action: TrackActionTypes
): TrackState {
  switch (action.type) {
    case TRACK_GET_LIST_REQUEST:
      ipc.send('track:get-list:request', action.ids, action.albumId);
      return state;
    case TRACK_GET_LIST_RESPONSE:
      state.allByAlbumId[action.albumId] = action.results;
      return state;
    default:
      return state;
  }
}
