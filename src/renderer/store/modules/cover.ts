import { ipcRenderer as ipc } from 'electron';
import { EntityHashMap } from '../../utils/storeUtils';
import { Album } from './album';
import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_COVER_GET_REQUEST
} = IPC_MESSAGES;

export interface CoverState {
  allById: EntityHashMap<string>;
}

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
  async (dispatch: Function): Promise<void> => {
    dispatch({
      type: COVER_GET_RESPONSE,
      path: await ipc.invoke(IPC_COVER_GET_REQUEST, album),
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
