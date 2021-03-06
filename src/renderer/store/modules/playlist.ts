import { ipcRenderer as ipc } from 'electron';
import createCachedSelector from 're-reselect';
import { intersection, sample, sortBy } from 'lodash';
import { customAlphabet } from 'nanoid';
import {
  EntityHashMap,
  toArray,
  toObj,
  removeIds,
  ensureAll,
  updateId
} from '../../utils/storeUtils';

import { ApplicationState } from '../store';

import {
  Album,
  selectors as albumSelectors,
  getAlbumListRequest
} from './album';
import { Track } from './track';

import { IPC_MESSAGES, RECENT_PLAYLIST_COUNT } from '../../../constants';

const {
  IPC_PLAYLIST_GET_ALL_REQUEST,
  IPC_PLAYLIST_SAVE_REQUEST,
  IPC_PLAYLIST_DELETE_REQUEST,
  IPC_PLAYLIST_DELETE_LIST_REQUEST
} = IPC_MESSAGES;

const nanoid = customAlphabet('1234567890abcdef', 10);

export interface Playlist {
  _id: string;
  _rev?: string;
  title: string;
  created: string;
  accessed: string;
  albums: Album['_id'][];
}

export interface PlaylistState {
  allById: EntityHashMap<Playlist>;
  isLoading: boolean;
}

export const selectors = {
  state: ({ playlists }: ApplicationState): PlaylistState => playlists,
  allById: ({ playlists }: ApplicationState): EntityHashMap<Playlist> => playlists.allById,
  allByDate: ({ playlists }: ApplicationState): Playlist[] => sortBy(toArray(playlists.allById), 'created').reverse(),
  findById: (
    { playlists }: ApplicationState,
    id: Playlist['_id']
  ): Playlist => playlists.allById[id],
  recent: (
    { playlists }: ApplicationState,
    limit = RECENT_PLAYLIST_COUNT
  ): Playlist[] =>
    sortBy(
      toArray(playlists.allById),
      'accessed'
    ).reverse()
      .slice(0, limit)
      .sort((a: Playlist, b: Playlist) => a.title.localeCompare(b.title)),
  withoutAlbums: (
    { playlists }: ApplicationState,
    albumIDs: Album['_id'][]
  ): Playlist[] =>
    sortBy(
      toArray(playlists.allById)
      .filter(({ albums }) => !intersection(albums, albumIDs).length),
      'created'
    ).reverse()
};

type GetPlaylistByIdSelection = {
  playlist: Playlist;
  albums: EntityHashMap<Album>;
  isLoading: boolean;
  currentPlaylistId: Playlist['_id'];
  currentAlbumId: Album['_id'];
  currentTrackId: Track['_id'];
}

export const getPlaylistById = createCachedSelector(
  selectors.state,
  selectors.findById,
  albumSelectors.allById,
  ({ player }: ApplicationState) => player,
  (state, playlist, albums, player): GetPlaylistByIdSelection => {
    const foundAlbums = playlist && playlist.albums ? toObj(
      playlist.albums
        .map((id: Album['_id']) => albums[id])
        .filter(x => !!x)
    ) : {};
    return {
      ...player,
      isLoading: state.isLoading,
      playlist: playlist || {} as Playlist,
      albums: foundAlbums
    }
  }
)(
  (_state_: ApplicationState, id: Playlist['_id']): Playlist['_id'] => id
);

const NEW_PLAYLIST_NAMES: string[] = [
  'Awesome Playlist',
  'Incredible Playlist',
  'Wonderful Playlist',
  'Blissful Playlist',
  'Unbeatable Playlist'
];

export function getDefaultPlaylist(): Playlist {
  const now = new Date().toISOString();
  const _id = nanoid();
  return {
    _id,
    _rev: null,
    title: sample(NEW_PLAYLIST_NAMES),
    created: now,
    accessed: now,
    albums: []
  };
}

export const PLAYLIST_GET_REQUEST           = 'playa/playlists/GET_REQUEST';
export const PLAYLIST_GET_RESPONSE          = 'playa/playlists/GET_RESPONSE';
export const PLAYLIST_GET_ALL_REQUEST       = 'playa/playlists/GET_ALL_REQUEST';
export const PLAYLIST_GET_ALL_RESPONSE      = 'playa/playlists/GET_ALL_RESPONSE';
export const PLAYLIST_GET_LIST_REQUEST      = 'playa/playlists/GET_LIST_REQUEST';
export const PLAYLIST_GET_LIST_RESPONSE     = 'playa/playlists/GET_LIST_RESPONSE';
export const PLAYLIST_SAVE_REQUEST          = 'playa/playlists/SAVE_REQUEST';
export const PLAYLIST_SAVE_RESPONSE         = 'playa/playlists/SAVE_RESPONSE';
export const PLAYLIST_DELETE_REQUEST        = 'playa/playlists/DELETE_REQUEST';
export const PLAYLIST_DELETE_RESPONSE       = 'playa/playlists/DELETE_RESPONSE';
export const PLAYLIST_DELETE_LIST_REQUEST   = 'playa/playlists/DELETE_LIST_REQUEST';
export const PLAYLIST_DELETE_LIST_RESPONSE  = 'playa/playlists/DELETE_LIST_RESPONSE';

interface GetPlaylistRequestAction {
  type: typeof PLAYLIST_GET_REQUEST;
  id: Playlist['_id'];
}

interface GetPlaylistResponseAction {
  type: typeof PLAYLIST_GET_RESPONSE;
  playlist: Playlist;
}

interface GetAllPlaylistRequestAction {
  type: typeof PLAYLIST_GET_ALL_REQUEST;
}

interface GetAllPlaylistResponseAction {
  type: typeof PLAYLIST_GET_ALL_RESPONSE;
  playlists: Playlist[];
}

interface GetListPlaylistResponseAction {
  type: typeof PLAYLIST_GET_LIST_RESPONSE;
  playlists: Playlist[];
}

interface SavePlaylistRequestAction {
  type: typeof PLAYLIST_SAVE_REQUEST;
  playlist: Playlist;
}

interface SavePlaylistResponseAction {
  type: typeof PLAYLIST_SAVE_RESPONSE;
  playlist: Playlist;
}

interface DeletePlaylistRequestAction {
  type: typeof PLAYLIST_DELETE_REQUEST;
  playlist: Playlist;
}

interface DeletePlaylistResponseAction {
  type: typeof PLAYLIST_DELETE_RESPONSE;
  playlist: Playlist;
}

interface DeletePlaylistListRequestAction {
  type: typeof PLAYLIST_DELETE_LIST_REQUEST;
  playlists: Playlist[];
}

interface DeletePlaylistListResponseAction {
  type: typeof PLAYLIST_DELETE_LIST_RESPONSE;
  playlists: Playlist[];
}

export type PlaylistActionTypes =
    GetPlaylistRequestAction
  | GetPlaylistResponseAction
  | GetAllPlaylistRequestAction
  | GetAllPlaylistResponseAction
  | GetListPlaylistResponseAction
  | SavePlaylistRequestAction
  | SavePlaylistResponseAction
  | DeletePlaylistRequestAction
  | DeletePlaylistResponseAction
  | DeletePlaylistListRequestAction
  | DeletePlaylistListResponseAction;

export const getPlaylistRequest = (id: Playlist['_id']): Function =>
  async (dispatch: Function, getState: Function): Promise<void> => {
    dispatch({
      type: PLAYLIST_GET_REQUEST,
      id
    });

    const { playlists, albums } = getState();
    let playlist = playlists.allById[id];

    if (!playlist) {
      const results = await ipc.invoke(IPC_PLAYLIST_GET_ALL_REQUEST);
      if (results.length === 0) {
        return;
      }
      playlist = results[0];
    }

    const notFoundAlbums =
      playlist.albums.filter((_id: Album['_id']) => !albums.allById[_id]);

    if (notFoundAlbums.length > 0) {
      dispatch(getAlbumListRequest(notFoundAlbums));
    }
    dispatch({
      type: PLAYLIST_GET_RESPONSE,
      playlist
    });
  }

export const getAllPlaylistsRequest = (): Function =>
  async (dispatch: Function): Promise<void> => {
    const playlists = await ipc.invoke(IPC_PLAYLIST_GET_ALL_REQUEST);
    dispatch({
      type: PLAYLIST_GET_ALL_RESPONSE,
      playlists
    });
  }

export const savePlaylistRequest = (playlist: Playlist): Function =>
  async (dispatch: Function): Promise<void> => {
    const savedPlaylist = await ipc.invoke(IPC_PLAYLIST_SAVE_REQUEST, playlist);
    dispatch({
      type: PLAYLIST_SAVE_RESPONSE,
      playlist: savedPlaylist
    });
  }

export const deletePlaylistRequest = (playlist: Playlist): Function =>
  async (dispatch: Function): Promise<void> => {
    const deletedPlaylist = await ipc.invoke(IPC_PLAYLIST_DELETE_REQUEST, playlist);
    dispatch({
      type: PLAYLIST_DELETE_RESPONSE,
      playlist: deletedPlaylist
    });
  }

export const deletePlaylistListRequest = (playlists: Playlist[]): Function =>
  async (dispatch: Function): Promise<void> => {
    await ipc.invoke(IPC_PLAYLIST_DELETE_LIST_REQUEST, playlists);
    dispatch({
      type: PLAYLIST_DELETE_LIST_RESPONSE,
      playlists
    });
  }

const INITIAL_STATE: PlaylistState = {
	allById: {},
  isLoading: false
}

export default function reducer(
  state: PlaylistState = INITIAL_STATE,
  action: PlaylistActionTypes
): PlaylistState {
  switch (action.type) {
    case PLAYLIST_GET_REQUEST:
      return {
        ...state,
        isLoading: true
      };
    case PLAYLIST_GET_ALL_RESPONSE:
      return {
        ...state,
        allById: toObj(ensureAll<Playlist>(action.playlists, getDefaultPlaylist))
      };
    case PLAYLIST_GET_LIST_RESPONSE:
      return {
        ...state,
        allById: {
          ...state.allById,
          ...toObj(ensureAll<Playlist>(action.playlists, getDefaultPlaylist))
        }
      };
    case PLAYLIST_GET_RESPONSE:
    case PLAYLIST_SAVE_RESPONSE:
      return {
        ...state,
        isLoading: false,
        allById: updateId(state.allById, action.playlist._id, action.playlist)
      };
    case PLAYLIST_DELETE_RESPONSE:
      return {
        ...state,
        allById: removeIds(state.allById, [action.playlist._id])
      };
    case PLAYLIST_DELETE_LIST_RESPONSE:
      return {
        ...state,
        allById: removeIds(state.allById, action.playlists.map(({ _id }) => _id))
      };
    case PLAYLIST_GET_ALL_REQUEST:
    case PLAYLIST_SAVE_REQUEST:
    case PLAYLIST_DELETE_REQUEST:
    case PLAYLIST_DELETE_LIST_REQUEST:
    default:
      return state;
  }
}
