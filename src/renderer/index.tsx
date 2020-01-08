import { ipcRenderer as ipc } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import MainLayout from './layouts/MainLayout';
import { store, history } from './store/store';
import { Playlist, PLAYLIST_UPDATE, PLAYLIST_REMOVE, PLAYLIST_LOAD_ALL } from './store/modules/playlist';
import { Album, ALBUM_SEARCH_RESULTS } from './store/modules/album';
import { SEARCH } from './routes'
import './style.scss';

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

ipc.on('playlist:load-all', (_event, playlists: Playlist[]) => {
  store.dispatch({
    type: PLAYLIST_LOAD_ALL,
    playlists
  });
});

ipc.on('album:search:results', (_event, results: Album[]) => {
  store.dispatch({
    type: ALBUM_SEARCH_RESULTS,
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
