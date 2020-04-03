import { ipcRenderer as ipc } from 'electron';
import { EntityHashMap } from '../../utils/storeUtils';
import { ApplicationState } from '../store';
import { Artist } from './artist';
import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_ARTIST_PICTURE_GET_REQUEST,
  IPC_ARTIST_PICTURE_GET_FROM_URL_REQUEST
} = IPC_MESSAGES;

export interface ArtistPictureState {
  allById: EntityHashMap<string>;
}

export const selectors = {
  state: ({ artistPictures }: ApplicationState): ArtistPictureState => artistPictures,
  allById: ({ artistPictures }: ApplicationState): EntityHashMap<string> => artistPictures.allById,
  findById: ({ artistPictures }: ApplicationState, id: string): string => artistPictures.allById[id]
};

export const ARTIST_PICTURE_GET_REQUEST  = 'playa/artistPicture/ARTIST_PICTURE_GET_REQUEST';
export const ARTIST_PICTURE_GET_RESPONSE = 'playa/artistPicture/ARTIST_PICTURE_GET_RESPONSE';

interface GetArtistPictureRequestAction {
  type: typeof ARTIST_PICTURE_GET_REQUEST;
  artist: Artist;
}

interface GetArtistPictureResponseAction {
  type: typeof ARTIST_PICTURE_GET_RESPONSE;
  artist: Artist;
  path: string;
}

export type ArtistPictureActionTypes =
    GetArtistPictureRequestAction
  | GetArtistPictureResponseAction;

export const getArtistPictureRequest = (artist: Artist): Function =>
  async (dispatch: Function, getState: Function): Promise<void> => {
    const { artistPictures } = getState();
    if (artistPictures.allById[artist._id]) {
      return;
    }
    dispatch({
      type: ARTIST_PICTURE_GET_RESPONSE,
      path: await ipc.invoke(IPC_ARTIST_PICTURE_GET_REQUEST, artist),
      artist
    });
  }

export const getArtistPictureFromUrlRequest = (
  artist: Artist,
  url: string,
  timestamp = +new Date()
): Function =>
  async (dispatch: Function): Promise<void> => {
    const artistPicturePath = await ipc.invoke(IPC_ARTIST_PICTURE_GET_FROM_URL_REQUEST, artist, url);
    dispatch({
      type: ARTIST_PICTURE_GET_RESPONSE,
      path: `${artistPicturePath}?${timestamp}`,
      artist
    });
  }

const INITIAL_STATE = {
  allById: {}
};

export default function reducer(
  state: ArtistPictureState = INITIAL_STATE,
  action: ArtistPictureActionTypes
): ArtistPictureState {
  switch (action.type) {
    case ARTIST_PICTURE_GET_RESPONSE:
      return {
        ...state,
        allById: {
          ...state.allById,
          ...{[action.artist._id]: action.path}
        }
      }
    case ARTIST_PICTURE_GET_REQUEST:
    default:
      return state;
  }
}
