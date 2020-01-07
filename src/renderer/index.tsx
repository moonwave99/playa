import { ipcRenderer } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import MainLayout from './layouts/MainLayout';
import { store, history } from './store/store';
import { Playlist, PLAYLIST_UPDATE, PLAYLIST_REMOVE, PLAYLIST_LOAD_ALL } from './store/modules/playlist';
import { SEARCH } from './routes'
import './style.scss';

ipcRenderer.on('error', (_event, error) => {
  console.log(error);
});

ipcRenderer.on('search:show', () => {
  history.replace(SEARCH);
});

ipcRenderer.on('playlist:update', (_event, playlist: Playlist) => {
  store.dispatch({
    type: PLAYLIST_UPDATE,
    playlist
  });
});

ipcRenderer.on('playlist:remove', (_event, playlist: Playlist) => {
  store.dispatch({
    type: PLAYLIST_REMOVE,
    playlist
  });
});

ipcRenderer.on('playlist:load-all', (_event, playlists: Playlist[]) => {
  store.dispatch({
    type: PLAYLIST_LOAD_ALL,
    playlists
  });
});

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <MainLayout />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);
