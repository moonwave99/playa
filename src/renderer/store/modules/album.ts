import { ipcRenderer as ipc } from 'electron';
import createCachedSelector from 're-reselect';
import {
  EntityHashMap,
  toObj,
  toArray,
  ensureAll,
  updateId,
  removeIds
} from '../../utils/storeUtils';

import { ApplicationState } from '../store';

import {
  Artist,
  VariousArtist,
  selectors as artistSelectors,
  ARTIST_SAVE_RESPONSE
} from './artist';

import {
  Track,
  selectors as trackSelectors,
  getTrackListResponse
} from './track';

import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_ALBUM_SAVE_REQUEST,
  IPC_ALBUM_GET_LIST_REQUEST,
  IPC_ALBUM_CONTENT_REQUEST,
  IPC_ARTIST_SAVE_REQUEST,
  IPC_TRACK_GET_LIST_REQUEST,
  IPC_COVER_GET_REQUEST,
  IPC_COVER_GET_FROM_URL_REQUEST
} = IPC_MESSAGES;

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

export type Album = {
  _id: string;
  _rev?: string;
  isAlbumFromVA?: boolean;
  artist: Artist['_id'];
  title: string;
  year?: number;
  type: AlbumTypes;
  created: string;
  path: string;
  tracks: Track['_id'][];
  cover?: string;
  noDiscogsResults?: boolean;
}

export function getDefaultAlbum(): Album {
  const now = new Date().toISOString();
  return {
    _id: null,
    _rev: null,
    artist: '',
    title: '',
    type: AlbumTypes.Album,
    created: now,
    path: '',
    tracks: [],
    cover: null,
    noDiscogsResults: false
  };
}

export interface AlbumState {
  allById: EntityHashMap<Album>;
  editingAlbumId: Album['_id'];
}

export const selectors = {
  state: ({ albums }: { albums: AlbumState }): AlbumState => albums,
  allById: ({ albums }: { albums: AlbumState }): EntityHashMap<Album> => albums.allById,
  findById: ({ albums }: { albums: AlbumState }, id: Album['_id']): Album => albums.allById[id],
  findByList: ({ albums }: { albums: AlbumState }, ids: Album['_id'][]): Album[] => ids.map(id => albums.allById[id]),
  findByVariousArtists: ({ albums }: { albums: AlbumState }): Album[] =>
    toArray(albums.allById).filter(({ isAlbumFromVA }) => isAlbumFromVA)
};

type GetAlbumContentByIdSelection = {
  artist: Artist;
  tracks: Track[];
}

export const getAlbumContentById = createCachedSelector(
  selectors.findById,
  artistSelectors.allById,
  trackSelectors.allById,
  (album, artists, tracks): GetAlbumContentByIdSelection => ({
    artist: album.isAlbumFromVA ? VariousArtist : artists[album.artist],
    tracks: album.tracks.map(id => tracks[id]).filter(x => !!x)
  })
)((_state_: ApplicationState, id: Album['_id']) => id);

export const ALBUM_GET_REQUEST          = 'playa/album/GET_REQUEST';
export const ALBUM_GET_RESPONSE         = 'playa/album/GET_RESPONSE';
export const ALBUM_SAVE_REQUEST         = 'playa/album/SAVE_REQUEST';
export const ALBUM_SAVE_RESPONSE        = 'playa/album/SAVE_RESPONSE';
export const ALBUM_GET_LIST_REQUEST     = 'playa/album/GET_LIST_REQUEST';
export const ALBUM_GET_LIST_RESPONSE    = 'playa/album/GET_LIST_RESPONSE';
export const ALBUM_GET_CONTENT_REQUEST  = 'playa/album/GET_CONTENT_REQUEST';
export const ALBUM_GET_CONTENT_RESPONSE = 'playa/album/GET_CONTENT_RESPONSE';
export const ALBUM_DELETE_REQUEST       = 'playa/album/DELETE_REQUEST';
export const ALBUM_DELETE_RESPONSE      = 'playa/album/DELETE_RESPONSE';
export const ALBUM_DELETE_LIST_REQUEST  = 'playa/album/DELETE_LIST_REQUEST';
export const ALBUM_DELETE_LIST_RESPONSE = 'playa/album/DELETE_LIST_RESPONSE';
export const ALBUM_SET_EDITING          = 'playa/album/SET_EDITING';

interface GetAlbumRequestAction {
  type: typeof ALBUM_GET_REQUEST;
  id: Album['_id'];
}

interface GetAlbumResponseAction {
  type: typeof ALBUM_GET_RESPONSE;
  album: Album;
}

interface GetAlbumListRequestAction {
  type: typeof ALBUM_GET_LIST_REQUEST;
  ids: Album['_id'][];
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

interface DeleteAlbumResponseAction {
  type: typeof ALBUM_DELETE_RESPONSE;
  album: Album;
}

interface DeleteAlbumListResponseAction {
  type: typeof ALBUM_DELETE_LIST_RESPONSE;
  albums: Album[];
}

interface SetEditingAlbumAction {
  type: typeof ALBUM_SET_EDITING;
  editingAlbumId: Album['_id'];
}

export type AlbumActionTypes =
    GetAlbumRequestAction
  | GetAlbumResponseAction
  | SaveAlbumResponseAction
  | GetAlbumListRequestAction
  | GetAlbumListResponseAction
  | GetAlbumContentRequestAction
  | GetAlbumContentResponseAction
  | DeleteAlbumResponseAction
  | DeleteAlbumListResponseAction
  | SetEditingAlbumAction;

export const getAlbumRequest = (id: Album['_id']): Function =>
  async (dispatch: Function, getState: Function): Promise<void> => {
    const { albums, tracks } = getState();
    let album = albums.allById[id];

    if (!album) {
      const results = await ipc.invoke(IPC_ALBUM_GET_LIST_REQUEST, [id]);
      if (results.length === 0) {
        return;
      }
      album = results[0];
    }

    if (album.tracks.length === 0) {
      album = await ipc.invoke(IPC_ALBUM_CONTENT_REQUEST, album);
      dispatch({
        type: ALBUM_GET_RESPONSE,
        album
      });
    }

    const notFoundTracks =
      album.tracks.filter((_id: Track['_id']) => !tracks.allById[_id]);

    if (notFoundTracks.length > 0) {
      const { tracks: albumTracks } = await ipc.invoke(IPC_TRACK_GET_LIST_REQUEST, notFoundTracks);
      dispatch(getTrackListResponse(albumTracks));
    }
  }

export const getAlbumListResponse = (results: Album[]): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_GET_LIST_RESPONSE,
      results
    });
  }

export const getAlbumListRequest = (ids: Album['_id'][]): Function =>
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

export const reloadAlbumContent = (albumID: Album['_id']): Function =>
  async (dispatch: Function, getState: Function): Promise<void> => {
    const { albums } = getState();
    const album = albums.allById[albumID];
    const reloadedAlbum = await ipc.invoke(IPC_ALBUM_CONTENT_REQUEST, album);
    const { tracks: reloadedTracks }
      = await ipc.invoke(IPC_TRACK_GET_LIST_REQUEST, reloadedAlbum.tracks, true);
    dispatch(getAlbumContentResponse(reloadedAlbum));
    dispatch(getTrackListResponse(reloadedTracks));
  }

export const editAlbum = (editingAlbumId: Album['_id']): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_SET_EDITING,
      editingAlbumId
    });
  }

export const updateAlbum = (album: Album, artist: Artist): Function =>
  async (dispatch: Function): Promise<void> => {
    let artistId = artist._id;
    if (!artistId) {
      const savedArtist = await ipc.invoke(IPC_ARTIST_SAVE_REQUEST, artist);
      artistId = savedArtist._id;
      dispatch({
        type: ARTIST_SAVE_RESPONSE,
        artist: savedArtist
      });
    }
    dispatch(saveAlbumRequest({ ...album, artist: artistId }));
  }

export const getAlbumCoverRequest = (album: Album): Function =>
  async (dispatch: Function, getState: Function): Promise<void> => {
    const { artists } = getState();
    const { artist: artistId, type } = album;
    const artist = artists.allById[artistId];
    const albumTypeHasNoCover =
      type === AlbumTypes.Remix || type === AlbumTypes.Various;
    if (album.cover || album.noDiscogsResults || albumTypeHasNoCover || !artist) {
      return;
    }

    const cover = await ipc.invoke(IPC_COVER_GET_REQUEST, album, artist);
    const savedAlbum = await ipc.invoke(IPC_ALBUM_SAVE_REQUEST, {
      ...album,
      cover,
      noDiscogsResults: !cover
    });

    dispatch({
      type: ALBUM_SAVE_RESPONSE,
      album: savedAlbum
    });
  }

export const getAlbumCoverFromUrlRequest = (
  album: Album,
  url: string
): Function =>
  async (dispatch: Function): Promise<void> => {
    const { type } = album;
    const albumTypeHasNoCover =
      type === AlbumTypes.Remix || type === AlbumTypes.Various;
    if (albumTypeHasNoCover) {
      return;
    }
    const cover = await ipc.invoke(IPC_COVER_GET_FROM_URL_REQUEST, album, url);
    const savedAlbum = await ipc.invoke(IPC_ALBUM_SAVE_REQUEST, {
      ...album,
      cover,
      noDiscogsResults: !cover
    });

    dispatch({
      type: ALBUM_SAVE_RESPONSE,
      album: savedAlbum
    });
  }

const INITIAL_STATE = {
  allById: {},
  editingAlbumId: null as Album['_id']
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
    case ALBUM_GET_RESPONSE:
    case ALBUM_GET_CONTENT_RESPONSE:
      return {
        ...state,
        allById: updateId(state.allById, action.album._id, action.album)
      };
    case ALBUM_DELETE_RESPONSE:
      return {
        ...state,
        allById: removeIds(state.allById, [action.album._id])
      };
    case ALBUM_DELETE_LIST_RESPONSE:
      return {
        ...state,
        allById: removeIds(state.allById, action.albums.map(({ _id }) => _id))
      };
    case ALBUM_SET_EDITING:
      return {
        ...state,
        editingAlbumId: action.editingAlbumId
      };
    case ALBUM_GET_CONTENT_REQUEST:
    case ALBUM_GET_LIST_REQUEST:
    default:
			return state;
  }
}
