import { intersection, uniq, without } from 'lodash';
import { ipcRenderer as ipc } from 'electron';
import { toArray, getFromList } from '../../utils/storeUtils';

import {
  Playlist,
  PLAYLIST_GET_LIST_RESPONSE
} from './playlist';

import {
  Album,
  ALBUM_GET_LIST_RESPONSE,
  ALBUM_DELETE_LIST_RESPONSE,
  saveAlbumRequest
} from './album';

import {
  Artist,
  VARIOUS_ARTISTS_ID,
  saveArtistRequest
} from './artist';

import {
  Track,
  getTrackListRequest
} from './track';

import {
  PLAYER_UPDATE_QUEUE
} from './player';

import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_ALBUM_GET_LATEST_REQUEST,
  IPC_ALBUM_DELETE_LIST_REQUEST,
  IPC_PLAYLIST_SAVE_LIST_REQUEST,
  IPC_TRACK_DELETE_LIST_REQUEST
} = IPC_MESSAGES;

const DEFAULT_LATEST_ALBUM_LIMIT = 14;

export interface LibraryState {
  latestAlbumId: Album['_id'];
  latest: Album['_id'][];
  loadingLatest: boolean;
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

export const getLatestRequest = (
  dateFrom = new Date().toISOString(),
  limit = DEFAULT_LATEST_ALBUM_LIMIT
): Function =>
  async (dispatch: Function): Promise<void> => {
    dispatch({
      type: LIBRARY_GET_LATEST_REQUEST
    });
    const results: Album[] = await ipc.invoke(IPC_ALBUM_GET_LATEST_REQUEST, dateFrom, limit);
    dispatch({
      type: ALBUM_GET_LIST_RESPONSE,
      results
    });
    dispatch({
      type: LIBRARY_GET_LATEST_RESPONSE,
      results
    });
  }

type ImportAlbumParams = {
  album: Album;
  artist: Artist;
  tracks: Track[];
}

export const importAlbum = ({
  album,
  artist,
  tracks,
}: ImportAlbumParams): Function =>
  (dispatch: Function, getState: Function): void => {
    const state = getState();
    const { latestArtistId, allById: artists } = state.artists;

    let artistToSave = artist;
    if (!artist._id) {
      const existingArtist = toArray(artists).find(
        ({ name }) => name.toLowerCase() === artist.name.toLowerCase()
      ) as Artist;
      if (existingArtist) {
        artistToSave = existingArtist;
      }
    }

    const { latestAlbumId } = state.library;
    if (!album.isAlbumFromVA) {
      dispatch(saveArtistRequest({
        ...artistToSave,
        _id: artistToSave._id || `${+latestArtistId + 1}`
      }));
    }

    const updatedAlbum = {
      ...album,
      _id: `${+latestAlbumId + 1}`,
      artist: album.isAlbumFromVA
        ? VARIOUS_ARTISTS_ID
        : artistToSave._id || `${+latestArtistId + 1}`
    };

    dispatch(
      getTrackListRequest(
        tracks.map(({ _id }) => _id )
      )
    );
    dispatch(saveAlbumRequest(updatedAlbum));
    dispatch({
      type: LIBRARY_ADD_TO_LATEST_ALBUMS,
      albums: [updatedAlbum]
    });
    dispatch({
      type: ALBUM_GET_LIST_RESPONSE,
      results: [updatedAlbum]
    });
  }

export const removeAlbums = (albumsToRemoveIDs: Album['_id'][]): Function =>
  async (dispatch: Function, getState: Function): Promise<void> => {
    const {
      library,
      albums,
      player,
      playlists,
      tracks
    } = getState();
    const currentAlbums: Album[] = library.latest.map((_id: Album['_id']) => albums.allById[_id]);
    const queue: Album['_id'][] = player.queue;
    const albumsToRemove = getFromList(albums.allById, albumsToRemoveIDs);
    const results = await ipc.invoke(IPC_ALBUM_DELETE_LIST_REQUEST, albumsToRemove);

    if (results.length === 0) {
      return;
    }

    dispatch({
      type: ALBUM_DELETE_LIST_RESPONSE,
      albums: albumsToRemove
    });

    const tracksToRemove = albumsToRemove.reduce((memo: Track[], album: Album) => {
      return [...memo, ...album.tracks.map(_id => tracks.allById[_id])];
    }, []);
    await ipc.invoke(IPC_TRACK_DELETE_LIST_REQUEST, tracksToRemove);

    dispatch({
      type: LIBRARY_GET_LATEST_RESPONSE,
      results: currentAlbums.filter(({ _id }) => albumsToRemoveIDs.indexOf(_id) < 0)
    });

    dispatch({
      type: PLAYER_UPDATE_QUEUE,
      queue: queue.filter(_id => albumsToRemoveIDs.indexOf(_id) < 0)
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
  latest: null as Album['_id'][],
  latestAlbumId: null as Album['_id'],
  loadingLatest: false
};

function getLatestAlbumId(albums: Album[]): Album['_id'] {
  if (!albums.length) {
    return '0';
  }
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
        ...state,
        latestAlbumId: getLatestAlbumId(action.results),
        latest: action.results.map(({ _id }) => _id),
        loadingLatest: false
      };
    case LIBRARY_ADD_TO_LATEST_ALBUMS:
      return {
        ...state,
        latestAlbumId: getLatestAlbumId(action.albums),
        latest: uniq([...action.albums.map(({ _id }) => _id), ...(state.latest || [])])
      };
    case LIBRARY_GET_LATEST_REQUEST:
      return {
        ...state,
        loadingLatest: true
      };
		default:
			return state;
  }
}
