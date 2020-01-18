import { History } from "history";
import { ipcRenderer as ipc } from 'electron';

import { IPC_MESSAGES } from '../../constants';

const {
  IPC_UI_NAVIGATE_TO,
  IPC_PLAYLIST_GET_ALL_RESPONSE,
  IPC_PLAYLIST_SAVE_RESPONSE,
  IPC_PLAYLIST_DELETE_RESPONSE,
  IPC_SEARCH_RESPONSE,
  IPC_ALBUM_GET_LIST_RESPONSE,
  IPC_ALBUM_CONTENT_RESPONSE,
  IPC_TRACK_GET_LIST_RESPONSE,
  IPC_COVER_GET_RESPONSE,
} = IPC_MESSAGES;

import {
  Playlist,
  getAllPlaylistsResponse,
  savePlaylistResponse,
  deletePlaylistResponse
} from '../store/modules/playlist';

import {
  Album,
  getAlbumListResponse,
  getAlbumContentResponse
} from '../store/modules/album';

import {
  Track,
  getTrackListRequest,
  getTrackListResponse
} from '../store/modules/track';

import {
  searchResponse
} from '../store/modules/search';

import {
  getCoverResponse
} from '../store/modules/cover';

export default function initIpc(history: History, dispatch: Function): void {
  ipc.on('error', (_event, error) => {
    console.log(error);
  });

  ipc.on(IPC_UI_NAVIGATE_TO, (_event, path: string) => {
    history.replace(path);
  });

  ipc.on(IPC_PLAYLIST_GET_ALL_RESPONSE, (_event, playlists: Playlist[]) => {
    dispatch(getAllPlaylistsResponse(playlists));
  });

  ipc.on(IPC_PLAYLIST_SAVE_RESPONSE, (_event, playlist: Playlist) => {
    dispatch(savePlaylistResponse(playlist));
  });

  ipc.on(IPC_PLAYLIST_DELETE_RESPONSE, (_event, playlist: Playlist) => {
    dispatch(deletePlaylistResponse(playlist));
  });

  ipc.on(IPC_SEARCH_RESPONSE, (_event, results: Album[], query: string) => {
    dispatch(searchResponse(results, query));
  });

  ipc.on(IPC_ALBUM_GET_LIST_RESPONSE, (_event, results: Album[]) => {
    dispatch(getAlbumListResponse(results));
  });

  ipc.on(IPC_ALBUM_CONTENT_RESPONSE, (_event, album: Album) => {
    dispatch(getAlbumContentResponse(album));
    dispatch(getTrackListRequest(album.tracks));
  });

  ipc.on(IPC_TRACK_GET_LIST_RESPONSE, (_event, results: Track[]) => {
    dispatch(getTrackListResponse(results));
  });

  ipc.on(IPC_COVER_GET_RESPONSE, (_event, path: string, album: Album) => {
    dispatch(getCoverResponse(path, album));
  });
}
