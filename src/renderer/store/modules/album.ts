import { ipcRenderer as ipc } from 'electron';
import { getTrackListResponse } from './track';
import { EntityHashMap, toObj, ensureAll, updateId } from '../../utils/storeUtils';

import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_ALBUM_SAVE_REQUEST,
  IPC_ALBUM_GET_LIST_REQUEST,
  IPC_ALBUM_CONTENT_REQUEST,
  IPC_TRACK_GET_LIST_REQUEST
} = IPC_MESSAGES;

export const VARIOUS_ARTISTS_ID = '_various-artists';

export enum AlbumTypes {
  Album = 'album',
  Ep = 'ep',
  Single = 'single',
  Compilation = 'compilation',
  Remix = 'remix',
  Bootleg = 'bootleg',
  Various = 'various',
  Soundtrack = 'soundtrack',
  Tribute = 'tribute'
}

export interface Album {
  _id: string;
  artist: string;
  title: string;
  year?: number;
  type: AlbumTypes;
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
    type: AlbumTypes.Album,
    created: now,
    path: '',
    tracks: []
  };
}

export interface AlbumState {
  allById: EntityHashMap<Album>;
}

export const ALBUM_SAVE_REQUEST         = 'playa/album/SAVE_REQUEST';
export const ALBUM_SAVE_RESPONSE        = 'playa/album/SAVE_RESPONSE';
export const ALBUM_GET_LIST_REQUEST     = 'playa/album/GET_LIST_REQUEST';
export const ALBUM_GET_LIST_RESPONSE    = 'playa/album/GET_LIST_RESPONSE';
export const ALBUM_GET_CONTENT_REQUEST  = 'playa/album/GET_CONTENT_REQUEST';
export const ALBUM_GET_CONTENT_RESPONSE = 'playa/album/GET_CONTENT_RESPONSE';

interface GetAlbumListRequestAction {
  type: typeof ALBUM_GET_LIST_REQUEST;
  ids: string[];
}

interface GetAlbumListResponseAction {
  type: typeof ALBUM_GET_LIST_RESPONSE;
  results: Album[];
}

interface SaveAlbumResponseAction {
  type: typeof ALBUM_SAVE_RESPONSE;
  album: Album;
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
    SaveAlbumResponseAction
  | GetAlbumListRequestAction
  | GetAlbumListResponseAction
  | GetAlbumContentRequestAction
  | GetAlbumContentResponseAction;

export const getAlbumListResponse = (results: Album[]): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_GET_LIST_RESPONSE,
      results
    });
  }

export const getAlbumListRequest = (ids: string[]): Function =>
  async (dispatch: Function): Promise<void> => {
    dispatch(
      getAlbumListResponse(
        await ipc.invoke(IPC_ALBUM_GET_LIST_REQUEST, ids)
      )
    );
  }

export const saveAlbumRequest = (album: Album): Function =>
  async (dispatch: Function): Promise<void> => {
    const savedAlbum = await ipc.invoke(IPC_ALBUM_SAVE_REQUEST, album);
    dispatch({
      type: ALBUM_SAVE_RESPONSE,
      album: savedAlbum
    });
  }

export const getAlbumContentResponse = (album: Album): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_GET_CONTENT_RESPONSE,
      album
    });
  }

export const getAlbumContentRequest = (album: Album): Function =>
  async (dispatch: Function): Promise<void> => {
    dispatch(
      getAlbumContentResponse(
        await ipc.invoke(IPC_ALBUM_CONTENT_REQUEST, album)
      )
    );
  }

export const reloadAlbumContent = (album: Album): Function =>
  async (dispatch: Function): Promise<void> => {
    const reloadedAlbum = await ipc.invoke(IPC_ALBUM_CONTENT_REQUEST, album);
    const reloadedTracks = await ipc.invoke(IPC_TRACK_GET_LIST_REQUEST, reloadedAlbum.tracks, true);
    dispatch(getAlbumContentResponse(reloadedAlbum));
    dispatch(getTrackListResponse(reloadedTracks));
  }

const INITIAL_STATE = {
  allById: {}
};

export default function reducer(
  state: AlbumState = INITIAL_STATE,
  action: AlbumActionTypes
): AlbumState {
  switch (action.type) {
    case ALBUM_GET_LIST_RESPONSE:
      return {
        ...state,
        allById: {
          ...state.allById,
          ...toObj(ensureAll<Album>(action.results, getDefaultAlbum))
        }
      };
    case ALBUM_SAVE_RESPONSE:
    case ALBUM_GET_CONTENT_RESPONSE:
      return {
        ...state,
        allById: updateId(state.allById, action.album._id, action.album)
      };
    case ALBUM_GET_CONTENT_REQUEST:
    case ALBUM_GET_LIST_REQUEST:
    default:
			return state;
  }
}
