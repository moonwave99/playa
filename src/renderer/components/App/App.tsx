import React, { FC, ReactElement, useState, useEffect, useRef } from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router';
import { generatePath } from 'react-router-dom';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { createSelector } from 'reselect';
import { uniq } from 'lodash';
import Player from '../../lib/player';
import { selectFolderDialog } from '../../lib/dialog';
import useImportAlbums from '../../hooks/useImportAlbums/useImportAlbums';
import useEditAlbum from '../../hooks/useEditAlbum/useEditAlbum';
import useAddAlbumsToPlaylist from '../../hooks/useAddAlbumsToPlaylist/useAddAlbumsToPlaylist';
import { AppHeader } from './AppHeader/AppHeader';
import { PlayerView } from '../PlayerView/PlayerView';
import { ArtistView } from '../ArtistView/ArtistView';
import { LibraryView } from '../LibraryView/LibraryView';
import { QueueView } from '../QueueView/QueueView';
import { SearchView } from '../SearchView/SearchView';
import { SidebarView } from '../SidebarView/SidebarView';
import { AllPlaylistContainer } from '../AllPlaylistContainer/AllPlaylistContainer';
import { PlaylistContainer } from '../PlaylistContainer/PlaylistContainer';
import { CustomDragLayer } from '../CustomDragLayer/CustomDragLayer';
import './App.scss';

import initIpc from '../../initializers/initIpc';
import { ApplicationState } from '../../store/store';

import {
  Playlist,
  getDefaultPlaylist,
  getAllPlaylistsRequest,
  savePlaylistRequest,
  selectors as playlistSelectors,
  PLAYLIST_GET_RESPONSE
} from '../../store/modules/playlist';
import { Album, selectors as albumSelectors } from '../../store/modules/album';
import { getAllArtistsRequest } from '../../store/modules/artist';
import {
  UILibraryView,
  setLibraryView,
  updateLocation
} from '../../store/modules/ui';

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

const appSelector = createSelector(
  playlistSelectors.allByDate,
  playlistSelectors.recent,
  playerSelectors.state,
  albumSelectors.state,
  ({ ui }: ApplicationState) => ui,
  (playlists, recentPlaylists, player, { allById: albums, editingAlbumId }, ui) => {
    return {
      playlists,
      recentPlaylists,
      currentPlaylistId: player.currentPlaylistId,
      currentAlbumId: player.currentAlbumId,
      editingAlbum: albums[editingAlbumId],
      title: ui.title
    }
  }
);

type AppProps = {
  player: Player;
  lastOpenedPlaylistId: Playlist['_id'];
  waveformBasePath: string;
  queue: Album['_id'][];
  onLibraryScroll: (scrolling: boolean) => void;
}

const CreatePlaylist = (): ReactElement => {
  const playlist = getDefaultPlaylist();
  const dispatch = useDispatch();
  const { _id } = playlist;
  dispatch({
    type: PLAYLIST_GET_RESPONSE,
    playlist
  });
  return <Redirect to={generatePath(PLAYLIST_SHOW, { _id })}/>;
}

export const App: FC<AppProps> = ({
  player,
  lastOpenedPlaylistId,
  waveformBasePath,
  queue,
  onLibraryScroll
}): ReactElement => {
  const mainElementRef = useRef(null);
  const history = useHistory();
  const store = useStore();
  const dispatch = useDispatch();
  const {
    playlists,
    recentPlaylists,
    currentPlaylistId,
    editingAlbum,
    title
  } = useSelector(appSelector);

  const [requestSearchFocus, setRequestSearchFocus] = useState(false);
  const [latestPlaylistResumed, setLatestPlaylistResumed] = useState(false);

  function onCreatePlaylist(albums: Album['_id'][] = []): void {
    const playlist = getDefaultPlaylist();
    dispatch({
      type: PLAYLIST_GET_RESPONSE,
      playlist: { ...playlist, albums }
    });
    history.replace(generatePath(PLAYLIST_SHOW, { _id: playlist._id }));
  }

  function onSavePlaylist(playlist: Playlist, albums: Album['_id'][] = []): void {
    dispatch(savePlaylistRequest({
      ...playlist,
      albums: uniq([...playlist.albums, ...albums])
    }));
  }

  const {
    show: showImportDialog,
    render: renderImportModal
  } = useImportAlbums(mainElementRef.current);

  const {
    show: showEditModal,
    render: renderEditModal
  } = useEditAlbum(mainElementRef.current);

  const {
    show: showAddAlbumsToPlaylistModal,
    render: renderAddAlbumsToPlaylistModal
  } = useAddAlbumsToPlaylist({
    appElement: mainElementRef.current,
    onCreatePlaylist,
    onSavePlaylist
  });

  function onFocusSearch(): void {
    setRequestSearchFocus(true);
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

  function addAlbumsToPlaylistHandler(albumIDs: Album['_id'][]): void {
    showAddAlbumsToPlaylistModal(albumIDs);
  }

  useEffect(() => {
    if (editingAlbum) {
      showEditModal(editingAlbum);
    }
  }, [editingAlbum]);

  useEffect(() => {
    dispatch(getAllPlaylistsRequest());
    dispatch(getAllArtistsRequest());
    const unsubscribeIpc = initIpc({
      history,
      dispatch,
      importMusicHandler,
      addAlbumsToPlaylistHandler,
      store,
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
    if (lastOpenedPlaylistId && playlists.length > 0 && !latestPlaylistResumed) {
      history.replace(generatePath(PLAYLIST_SHOW, { _id: lastOpenedPlaylistId }));
      setLatestPlaylistResumed(true);
    }
  }, [lastOpenedPlaylistId, playlists.length]);

  useEffect(() => {
    if (queue.length) {
      dispatch(updateQueue(queue));
    }
  }, [queue]);

  useEffect(() => {
    updateLocation(history.location.pathname);
  }, [history.location.pathname]);

  function libraryViewSwitch(view: UILibraryView): void {
    dispatch(setLibraryView(view));
  }

  function onQueueButtonDrop(albums: Album['_id'][] = []): void {
    dispatch(enqueueAtEnd(albums));
  }

  function onSearchFormBlur(): void {
    setRequestSearchFocus(false);
  }

  function onSearchFormSubmit(query: string): void {
		history.push(`${SEARCH}?query=${encodeURIComponent(query)}`);
  }

  function onLibraryDrop(folder: string): void {
    showImportDialog(folder);
  }

  return (
    <main className="app" ref={mainElementRef}>
      <AppHeader
        title={title}
        requestSearchFocus={requestSearchFocus}
        onSearchFormSubmit={onSearchFormSubmit}
        onSearchFormBlur={onSearchFormBlur}
        importMusicHandler={importMusicHandler}
        libraryViewSwitch={libraryViewSwitch}
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
              <LibraryView onDrop={onLibraryDrop} onScroll={onLibraryScroll}/>
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
              <AllPlaylistContainer
                playlists={playlists}
                currentPlaylistId={currentPlaylistId}/>
            </Route>
            <Route path={PLAYLIST_SHOW}>
              { playlists.length > 0
                ? <PlaylistContainer/>
                : <Redirect to={QUEUE}/>
              }
            </Route>
            <Route>
              <Redirect to={LIBRARY}/>
            </Route>
          </Switch>
        </div>
      </div>
      <div className="player-wrapper">
        <PlayerView player={player} waveformBasePath={waveformBasePath}/>
      </div>
      <CustomDragLayer/>
      { renderImportModal() }
      { renderEditModal() }
      { renderAddAlbumsToPlaylistModal() }
    </main>
  );
}
