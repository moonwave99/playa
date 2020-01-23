import { intersection, uniqBy, without } from 'lodash';
import { ipcRenderer as ipc } from 'electron';
import { toArray, ensureAll } from '../../utils/storeUtils';

import {
  Playlist,
  PLAYLIST_GET_LIST_RESPONSE
} from './playlist';

import {
  Album,
  getDefaultAlbum,
  ALBUM_GET_LIST_RESPONSE
} from './album';

import {
  PLAYER_UPDATE_QUEUE
} from './player';

import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_ALBUM_GET_LATEST_REQUEST,
  IPC_ALBUM_DELETE_LIST_REQUEST,
  IPC_PLAYLIST_SAVE_LIST_REQUEST
} = IPC_MESSAGES;

export interface LibraryState {
  latestAlbumID: Album['_id'];
  latest: Album[];
}

export const LIBRARY_GET_LATEST_REQUEST   = 'playa/library/GET_LATEST_REQUEST';
export const LIBRARY_GET_LATEST_RESPONSE  = 'playa/library/GET_LATEST_RESPONSE';
export const LIBRARY_ADD_TO_LATEST_ALBUMS = 'playa/library/ADD_TO_LATEST_ALBUMS';

interface LibraryGetLatestRequestAction {
  type: typeof LIBRARY_GET_LATEST_REQUEST;
}

interface LibraryGetLatestResponseAction {
  type: typeof LIBRARY_GET_LATEST_RESPONSE;
  results: Album[];
}

interface AddAlbumsToLatestLibraryAction {
  type: typeof LIBRARY_ADD_TO_LATEST_ALBUMS;
  albums: Album[];
}

export type LibraryActionTypes =
    LibraryGetLatestRequestAction
  | LibraryGetLatestResponseAction
  | AddAlbumsToLatestLibraryAction;

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

export const addAlbumsToLibrary = (albums: Album[]): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: LIBRARY_ADD_TO_LATEST_ALBUMS,
      albums
    })
  }

// #TODO: remove album from playlists, bulk update
export const removeAlbums = (albums: Album[]): Function =>
  async (dispatch: Function, getState: Function): Promise<void> => {
    const {
      library,
      player,
      playlists
    } = getState();
    const currentAlbums: Album[] = library.latest;
    const queue: Album['_id'][] = player.queue;
    const albumsToRemoveIDs = albums.map(({ _id }) => _id);

    const results = await ipc.invoke(IPC_ALBUM_DELETE_LIST_REQUEST, albums);

    if (results.length === 0) {
      return;
    }

    dispatch({
      type: LIBRARY_GET_LATEST_RESPONSE,
      results: currentAlbums.filter(({ _id }) => albumsToRemoveIDs.indexOf(_id) < 0)
    });
    dispatch({
      type: PLAYER_UPDATE_QUEUE,
      queue: queue.filter((_id) => albumsToRemoveIDs.indexOf(_id) < 0)
    });

    const playlistsToUpdate =
      toArray(playlists.allById)
      .filter(({ albums: albumIDs }) =>
        intersection(albumIDs, albumsToRemoveIDs).length > 0
      ).map((playlist: Playlist) => {
        return {
          ...playlist,
          albums: without(playlist.albums, ...albumsToRemoveIDs)
        }
      });

    if (playlistsToUpdate.length === 0) {
      return;
    }
    const updatedPlaylists: Array<{ id: string; rev: string; ok: boolean }>
      = await ipc.invoke(IPC_PLAYLIST_SAVE_LIST_REQUEST, playlistsToUpdate);

    dispatch({
      type: PLAYLIST_GET_LIST_RESPONSE,
      playlists: updatedPlaylists.map(({ id, rev: _rev }) => ({
        ...playlistsToUpdate.find(({ _id }) => _id === id),
        _rev
      }))
    });
  }

const INITIAL_STATE = {
  latest: [] as Album[],
  latestAlbumID: null as Album['_id']
};

function getLatestAlbumID(albums: Album[]): Album['_id'] {
  return [...albums].sort((a: Album, b: Album) =>
    new Date(b.created).getTime() - new Date(a.created).getTime()
  )[0]._id;
}

export default function reducer(
  state: LibraryState = INITIAL_STATE,
  action: LibraryActionTypes
): LibraryState {
  switch (action.type) {
    case LIBRARY_GET_LATEST_RESPONSE:
      return {
        latestAlbumID: getLatestAlbumID(action.results),
        latest: ensureAll<Album>(action.results, getDefaultAlbum),
      };
    case LIBRARY_ADD_TO_LATEST_ALBUMS:
      return {
        latestAlbumID: getLatestAlbumID(action.albums),
        latest: uniqBy([...action.albums, ...state.latest], '_id')
      };
    case LIBRARY_GET_LATEST_REQUEST:
		default:
			return state;
  }
}
