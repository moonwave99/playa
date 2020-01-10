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
  PLAYLIST_UPDATE,
  PLAYLIST_REMOVE
} from './store/modules/playlist';
import {
  Album,
  ALBUM_SEARCH_RESPONSE,
  ALBUM_GET_LIST_RESPONSE
} from './store/modules/album';

ipc.on('error', (_event, error) => {
  console.log(error);
});

ipc.on('search:show', () => {
  history.replace(SEARCH);
});

ipc.on('playlist:update', (_event, playlist: Playlist) => {
  store.dispatch({
    type: PLAYLIST_UPDATE,
    playlist
  });
});

ipc.on('playlist:remove', (_event, playlist: Playlist) => {
  store.dispatch({
    type: PLAYLIST_REMOVE,
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
    type: ALBUM_GET_LIST_RESPONSE,
    album
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
