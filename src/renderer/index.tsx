import { ipcRenderer as ipc } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import MainLayout from './layouts/MainLayout';
import { store, history } from './store/store';
import { SEARCH } from './routes'
import './style.scss';

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
  TRACK_GET_LIST_REQUEST
} from './store/modules/track';

import {
  Track,
  TRACK_GET_LIST_RESPONSE
} from './store/modules/track';

ipc.on('error', (_event, error) => {
  console.log(error);
});

ipc.on('search:show', () => {
  history.replace(SEARCH);
});

ipc.on('playlist:save:response', (_event, playlist: Playlist) => {
  store.dispatch({
    type: PLAYLIST_SAVE_RESPONSE,
    playlist
  });
});

ipc.on('playlist:delete:response', (_event, playlist: Playlist) => {
  store.dispatch({
    type: PLAYLIST_DELETE_RESPONSE,
    playlist
  });
});

ipc.on('playlist:get-all:response', (_event, playlists: Playlist[]) => {
  store.dispatch({
    type: PLAYLIST_GET_ALL_RESPONSE,
    playlists
  });
});

ipc.on('album:search:response', (_event, results: Album[]) => {
  store.dispatch({
    type: ALBUM_SEARCH_RESPONSE,
    results
  });
});

ipc.on('album:get-list:response', (_event, results: Album[]) => {
  store.dispatch({
    type: ALBUM_GET_LIST_RESPONSE,
    results
  });
});

ipc.on('album:content:response', (_event, album: Album) => {
  store.dispatch({
    type: ALBUM_GET_CONTENT_RESPONSE,
    album
  });
  store.dispatch({
    type: TRACK_GET_LIST_REQUEST,
    ids: album.tracks
  });
});

ipc.on('track:get-list:response', (_event, results: Track[]) => {
  store.dispatch({
    type: TRACK_GET_LIST_RESPONSE,
    results
  });
});

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <DndProvider backend={Backend}>
        <MainLayout />
      </DndProvider>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);
