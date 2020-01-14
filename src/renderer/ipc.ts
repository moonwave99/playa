import { ipcRenderer as ipc } from 'electron';
import { store, history } from './store/store';

import { IPC_MESSAGES } from '../constants';

const {
  IPC_UI_NAVIGATE_TO,
  IPC_PLAYLIST_GET_ALL_RESPONSE,
  IPC_PLAYLIST_SAVE_RESPONSE,
  IPC_PLAYLIST_DELETE_RESPONSE,
  IPC_ALBUM_SEARCH_RESPONSE,
  IPC_ALBUM_GET_LIST_RESPONSE,
  IPC_ALBUM_CONTENT_RESPONSE,
  IPC_TRACK_GET_LIST_RESPONSE,
  IPC_COVER_GET_RESPONSE,
} = IPC_MESSAGES;

import {
  Playlist,
  PLAYLIST_GET_ALL_RESPONSE,
  PLAYLIST_SAVE_RESPONSE,
  PLAYLIST_DELETE_RESPONSE
} from './store/modules/playlist';

import {
  Album,
  ALBUM_SEARCH_RESPONSE,
  ALBUM_GET_LIST_RESPONSE,
  ALBUM_GET_CONTENT_RESPONSE
} from './store/modules/album';

import {
  Track,
  TRACK_GET_LIST_RESPONSE,
  TRACK_GET_LIST_REQUEST
} from './store/modules/track';

import {
  COVER_GET_RESPONSE
} from './store/modules/cover';

export function initIpc(): void {
  ipc.on('error', (_event, error) => {
    console.log(error);
  });

  ipc.on(IPC_UI_NAVIGATE_TO, (_event, path: string) => {
    history.replace(path);
  });

  ipc.on(IPC_PLAYLIST_GET_ALL_RESPONSE, (_event, playlists: Playlist[]) => {
    store.dispatch({
      type: PLAYLIST_GET_ALL_RESPONSE,
      playlists
    });
  });

  ipc.on(IPC_PLAYLIST_SAVE_RESPONSE, (_event, playlist: Playlist) => {
    store.dispatch({
      type: PLAYLIST_SAVE_RESPONSE,
      playlist
    });
  });

  ipc.on(IPC_PLAYLIST_DELETE_RESPONSE, (_event, playlist: Playlist) => {
    store.dispatch({
      type: PLAYLIST_DELETE_RESPONSE,
      playlist
    });
  });

  ipc.on(IPC_ALBUM_SEARCH_RESPONSE, (_event, results: Album[]) => {
    store.dispatch({
      type: ALBUM_SEARCH_RESPONSE,
      results
    });
  });

  ipc.on(IPC_ALBUM_GET_LIST_RESPONSE, (_event, results: Album[]) => {
    store.dispatch({
      type: ALBUM_GET_LIST_RESPONSE,
      results
    });
  });

  ipc.on(IPC_ALBUM_CONTENT_RESPONSE, (_event, album: Album) => {
    store.dispatch({
      type: ALBUM_GET_CONTENT_RESPONSE,
      album
    });
    store.dispatch({
      type: TRACK_GET_LIST_REQUEST,
      ids: album.tracks
    });
  });

  ipc.on(IPC_TRACK_GET_LIST_RESPONSE, (_event, results: Track[]) => {
    store.dispatch({
      type: TRACK_GET_LIST_RESPONSE,
      results
    });
  });

  ipc.on(IPC_COVER_GET_RESPONSE, (_event, path: string, album: Album) => {
    store.dispatch({
      type: COVER_GET_RESPONSE,
      path,
      album
    });
  });
}
