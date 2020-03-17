import React, { FC, ReactElement, useState, useEffect } from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router';
import { generatePath } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ReactModal from 'react-modal';
import { createSelector } from 'reselect';
import Player from '../../lib/player';
import { selectFolderDialog } from '../../lib/dialog';
import useImportAlbums from '../../hooks/useImportAlbums/useImportAlbums';
import { AppHeader } from './AppHeader/AppHeader';
import { PlayerView } from '../PlayerView/PlayerView';
import { ArtistView } from '../ArtistView/ArtistView';
import { LibraryView } from '../LibraryView/LibraryView';
import { QueueView } from '../QueueView/QueueView';
import { SearchView } from '../SearchView/SearchView';
import { SidebarView } from '../SidebarView/SidebarView';
import { AllPlaylistContainer } from '../AllPlaylistContainer/AllPlaylistContainer';
import { PlaylistContainer } from '../PlaylistContainer/PlaylistContainer';
import { ImportView } from '../LibraryView/ImportView/ImportView';

import './App.scss';

import initIpc from '../../initializers/initIpc';
import { ApplicationState } from '../../store/store';
import { Album } from '../../store/modules/album';
import { getAllArtistsRequest, selectors as artistsSelectors } from '../../store/modules/artist';

import {
  Playlist,
  getDefaultPlaylist,
  getAllPlaylistsRequest,
  selectors as playlistSelectors,
  PLAYLIST_GET_RESPONSE
} from '../../store/modules/playlist';

import { updateLocation } from '../../store/modules/ui';

import {
  updateQueue,
  enqueueAtEnd,
  togglePlayback,
  selectors as playerSelectors
} from '../../store/modules/player';

import {
  QUEUE,
  SEARCH,
  PLAYLIST_ALL,
  PLAYLIST_CREATE,
  PLAYLIST_SHOW,
  ARTIST_SHOW,
  LIBRARY
} from '../../routes';

import {
  RECENT_PLAYLIST_COUNT
} from '../../../constants';

const appSelector = createSelector(
  playlistSelectors.allById,
  playerSelectors.state,
  artistsSelectors.state,
  ({ ui }: ApplicationState) => ui,
  ({ library }: ApplicationState) => library,
  (playlists, player, artists, ui, library) => {
    const playlistArray = Object.keys(playlists).map(id => playlists[id]);
    const recentPlaylists = playlistArray
      .sort((a: Playlist, b: Playlist) =>
        new Date(b.accessed).getTime() - new Date(a.accessed).getTime()
      ).slice(0, RECENT_PLAYLIST_COUNT);
    return {
      playlists: playlistArray,
      recentPlaylists,
      currentPlaylistId: player.currentPlaylistId,
      title: ui.title,
      latestAlbumId: library.latestAlbumId,
      latestArtistId: artists.latestArtistId
    }
  }
);

type AppProps = {
  player: Player;
  lastOpenedPlaylistId: Playlist['_id'];
  waveformBasePath: string;
  queue: Album['_id'][];
}

const CreatePlaylist = (): ReactElement => {
  const playlist = getDefaultPlaylist();
  const dispatch = useDispatch();
  dispatch({
    type: PLAYLIST_GET_RESPONSE,
    playlist
  });
  return <Redirect to={generatePath(PLAYLIST_SHOW, { _id: playlist._id })}/>;
}

export const App: FC<AppProps> = ({
  player,
  lastOpenedPlaylistId,
  waveformBasePath,
  queue
}): ReactElement => {
  const history = useHistory();
  const dispatch = useDispatch();
  const {
    playlists,
    recentPlaylists,
    currentPlaylistId,
    title,
    latestAlbumId,
    latestArtistId
  } = useSelector(appSelector);

  const [hasSearchFocus, setSearchFocus] = useState(false);

  const {
    folderToImport,
    tracksToImport,
    showImportModal,
    showImportDialog,
    onImportModalRequestClose,
    onImportFormSubmit
  } = useImportAlbums({ latestAlbumId, latestArtistId });

  function onFocusSearch(): void {
    setSearchFocus(true);
  }

  function onKeyDown(event: KeyboardEvent): void {
    // catch space keypress on non [data-key-catch] elements and toggle playback
    const target = event.target as HTMLElement;
    switch (event.code) {
      case 'Space':
        if (target.dataset.keyCatch !== 'Space') {
          dispatch(togglePlayback());
          event.preventDefault();
        }
        break;
    }
  }

  async function importMusicHandler(): Promise<void> {
    const folder = await selectFolderDialog();
    if (!folder) {
      return;
    }
    showImportDialog(folder);
  }

  useEffect(() => {
    dispatch(getAllPlaylistsRequest());
    dispatch(getAllArtistsRequest());
    const unsubscribeIpc = initIpc({
      history,
      dispatch,
      importMusicHandler,
      focusSearchHandler: onFocusSearch
    });
    document.addEventListener('keydown', onKeyDown);
    return (): void => {
      document.removeEventListener('keydown', onKeyDown);
      unsubscribeIpc();
    };
  }, []);

  // reopen last opened playlist on app restart
  useEffect(() => {
    if (lastOpenedPlaylistId) {
      history.replace(generatePath(PLAYLIST_SHOW, { _id: lastOpenedPlaylistId }));
    }
  }, [lastOpenedPlaylistId]);

  useEffect(() => {
    if (queue.length) {
      dispatch(updateQueue(queue));
    }
  }, [queue]);

  useEffect(() => {
    updateLocation(history.location.pathname);
  }, [history.location.pathname]);

  function onCreatePlaylist(albums: Album['_id'][] = []): void {
    const playlist = getDefaultPlaylist();
    dispatch({
      type: PLAYLIST_GET_RESPONSE,
      playlist: { ...playlist, albums }
    });
    history.replace(generatePath(PLAYLIST_SHOW, { _id: playlist._id }));
  }

  function onQueueButtonDrop(albums: Album['_id'][] = []): void {
    dispatch(enqueueAtEnd(albums));
  }

  function onSearchFormBlur(): void {
    setSearchFocus(false);
  }

  function onSearchFormSubmit(query: string): void {
		history.push(`${SEARCH}?query=${encodeURIComponent(query)}`);
  }

  function onLibraryDrop(folder: string): void {
    showImportDialog(folder);
  }

  return (
    <main className="app">
      <AppHeader
        title={title}
        hasSearchFocus={hasSearchFocus}
        onSearchFormSubmit={onSearchFormSubmit}
        onSearchFormBlur={onSearchFormBlur}
        importMusicHandler={importMusicHandler}
        onQueueButtonDrop={onQueueButtonDrop}/>
      <div className="main-container">
        <div className="sidebar-wrapper">
          <SidebarView
            currentPlaylistId={currentPlaylistId}
            recentPlaylists={recentPlaylists}
            onCreatePlaylist={onCreatePlaylist}/>
        </div>
        <div className="main-wrapper">
          <Switch>
            <Route path={ARTIST_SHOW}>
              <ArtistView/>
            </Route>
            <Route path={LIBRARY}>
              <LibraryView onDrop={onLibraryDrop}/>
            </Route>
            <Route path={QUEUE}>
              <QueueView/>
            </Route>
            <Route path={SEARCH}>
              <SearchView/>
            </Route>
            <Route path={PLAYLIST_CREATE} exact>
              <CreatePlaylist/>
            </Route>
            <Route path={PLAYLIST_ALL} exact>
              <AllPlaylistContainer playlists={playlists}/>
            </Route>
            <Route path={PLAYLIST_SHOW}>
              { playlists.length > 0 && <PlaylistContainer/> }
            </Route>
          </Switch>
        </div>
      </div>
      <div className="player-wrapper">
        <PlayerView player={player} waveformBasePath={waveformBasePath}/>
      </div>
      { showImportModal
        ? <ReactModal
            className={{
              base: 'modal-content',
              beforeClose: 'modal-content-before-close',
              afterOpen: 'modal-content-after-open'
            }}
            overlayClassName={{
              base: 'modal-overlay',
              beforeClose: 'modal-overlay-before-close',
              afterOpen: 'modal-overlay-after-open'
            }}
            shouldFocusAfterRender={true}
            onRequestClose={onImportModalRequestClose}
            isOpen={showImportModal}>
            <ImportView
              tracks={tracksToImport}
              folderToImport={folderToImport}
              onFormSubmit={onImportFormSubmit}/>
          </ReactModal>
        : null }
    </main>
  );
}
