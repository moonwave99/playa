import { ipcRenderer as ipc } from 'electron';
import { EntityHashMap } from '../../utils/storeUtils';
import { ApplicationState } from '../store';
import { Album, AlbumTypes } from './album';
import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_COVER_GET_REQUEST,
  IPC_COVER_GET_FROM_URL_REQUEST
} = IPC_MESSAGES;

export interface CoverState {
  allById: EntityHashMap<string>;
}

export const selectors = {
  state: ({ covers }: ApplicationState): CoverState => covers,
  allById: ({ covers }: ApplicationState): EntityHashMap<string> => covers.allById,
  findById: ({ covers }: ApplicationState, id: string): string => covers.allById[id]
};

export const COVER_GET_REQUEST  = 'playa/cover/COVER_GET_REQUEST';
export const COVER_GET_RESPONSE = 'playa/cover/COVER_GET_RESPONSE';

interface GetCoverRequestAction {
  type: typeof COVER_GET_REQUEST;
  album: Album;
}

interface GetCoverResponseAction {
  type: typeof COVER_GET_RESPONSE;
  album: Album;
  path: string;
}

export type CoverActionTypes =
    GetCoverRequestAction
  | GetCoverResponseAction;

export const getCoverRequest = (album: Album): Function =>
  async (dispatch: Function, getState: Function): Promise<void> => {
    const { covers, artists } = getState();
    const { _id, artist: artistId, type } = album;
    const artist = artists.allById[artistId];
    const albumTypeHasNoCover =
      type === AlbumTypes.Remix || type === AlbumTypes.Various;
    if (covers.allById[_id] || albumTypeHasNoCover || !artist) {
      return;
    }
    dispatch({
      type: COVER_GET_RESPONSE,
      path: await ipc.invoke(IPC_COVER_GET_REQUEST, album, artist),
      album
    });
  }

export const getCoverFromUrlRequest = (
  album: Album,
  url: string,
  timestamp = +new Date()
): Function =>
  async (dispatch: Function): Promise<void> => {
    const { type } = album;
    const albumTypeHasNoCover =
      type === AlbumTypes.Remix || type === AlbumTypes.Various;
    if (albumTypeHasNoCover) {
      return;
    }
    const coverPath = await ipc.invoke(IPC_COVER_GET_FROM_URL_REQUEST, album, url);
    dispatch({
      type: COVER_GET_RESPONSE,
      path: `${coverPath}?${timestamp}`,
      album
    });
  }

const INITIAL_STATE = {
  allById: {}
};

export default function reducer(
  state: CoverState = INITIAL_STATE,
  action: CoverActionTypes
): CoverState {
  switch (action.type) {
    case COVER_GET_RESPONSE:
      return {
        ...state,
        allById: {
          ...state.allById,
          ...{[action.album._id]: action.path}
        }
      }
    case COVER_GET_REQUEST:
    default:
      return state;
  }
}
