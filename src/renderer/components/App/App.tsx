import React, { FC, ReactElement, useState, useEffect } from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router';
import { generatePath } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import Player from '../../lib/player';
import { PlayerView } from '../PlayerView/PlayerView';
import { ArtistView } from '../ArtistView/ArtistView';
import { LibraryView } from '../LibraryView/LibraryView';
import { QueueView } from '../QueueView/QueueView';
import { SearchView } from '../SearchView/SearchView';
import { SidebarView } from '../SidebarView/SidebarView';
import { AllPlaylistContainer } from '../AllPlaylistContainer/AllPlaylistContainer';
import { PlaylistContainer } from '../PlaylistContainer/PlaylistContainer';

import initIpc from '../../initializers/initIpc';

import { getArtists } from '../../store/modules/library';
import { Album } from '../../store/modules/album';

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

import './App.scss';

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
  (playlists, player) => {
    const playlistArray = Object.keys(playlists).map(id => playlists[id]);
    const recentPlaylists = playlistArray
      .sort((a: Playlist, b: Playlist) =>
        new Date(b.accessed).getTime() - new Date(a.accessed).getTime()
      ).slice(0, RECENT_PLAYLIST_COUNT);
    return {
      playlists: playlistArray,
      recentPlaylists,
      currentPlaylistId: player.currentPlaylistId
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
    currentPlaylistId
  } = useSelector(appSelector);

  const [hasSearchFocus, setSearchFocus] = useState(false);

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

  useEffect(() => {
    dispatch(getAllPlaylistsRequest());
    dispatch(getArtists());
    const unsubscribeIpc = initIpc({
      history,
      dispatch,
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

  function onSearchBarBlur(): void {
    setSearchFocus(false);
  }

  function onSearchFormSubmit(query: string): void {
		history.push(`${SEARCH}?query=${encodeURIComponent(query)}`);
  }

  return (
    <main className="app">
      <div className="main-container">
        <div className="sidebar-wrapper">
          <SidebarView
            hasSearchFocus={hasSearchFocus}
            currentPlaylistId={currentPlaylistId}
            recentPlaylists={recentPlaylists}
            onSearchFormSubmit={onSearchFormSubmit}
            onSearchBarBlur={onSearchBarBlur}
            onCreatePlaylist={onCreatePlaylist}
            onQueueButtonDrop={onQueueButtonDrop}/>
        </div>
        <div className="main-wrapper">
          <Switch>
            <Route path={ARTIST_SHOW}>
              <ArtistView/>
            </Route>
            <Route path={LIBRARY}>
              <LibraryView/>
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
    </main>
  );
}
