import React, { FC, ReactElement, useState, useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router';
import { generatePath } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Player from '../../player';
import { PlayerView } from '../PlayerView/PlayerView';
import { LibraryView } from '../LibraryView/LibraryView';
import { QueueView } from '../QueueView/QueueView';
import { SearchView } from '../SearchView/SearchView';
import { SidebarView } from '../SidebarView/SidebarView';
import { AllPlaylistContainer } from '../AllPlaylistContainer/AllPlaylistContainer';
import { PlaylistContainer } from '../PlaylistContainer/PlaylistContainer';

import initIpc from '../../lib/initIpc';
import { Playlist, getAllPlaylistsRequest } from '../../store/modules/playlist';
import { Album } from '../../store/modules/album';
import { updateQueue, togglePlayback } from '../../store/modules/player';
import './App.scss';

import {
  QUEUE,
  SEARCH,
  PLAYLIST_ALL,
  PLAYLIST_SHOW,
  LIBRARY
} from '../../routes';

import {
  RECENT_PLAYLIST_COUNT
} from '../../../constants';

type AppProps = {
  player: Player;
  lastOpenedPlaylistId: Playlist['_id'];
  waveformBasePath: string;
  queue: Album['_id'][];
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
  } = useSelector(({ playlists, player }) => {
    const playlistArray = Object.keys(playlists.allById).map(id => playlists.allById[id]);
    const recentPlaylists = playlistArray
      .sort((a: Playlist, b: Playlist) =>
        new Date(b.accessed).getTime() - new Date(a.accessed).getTime()
      ).slice(0, RECENT_PLAYLIST_COUNT);
    return {
      playlists: playlistArray,
      recentPlaylists,
      currentPlaylistId: player.currentPlaylistId
    }
  });

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
    const unsubscribeIpc = initIpc({
      history,
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

  function onCreatePlaylistButtonClick(): void {
    const now = new Date().toISOString();
    history.replace(generatePath(PLAYLIST_SHOW, { _id: now }));
  }

  function onSearchBarBlur(): void {
    setSearchFocus(false);
  }

  function onSearchFormSubmit(query: string): void {
		history.push(`${SEARCH}?query=${query}`);
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
            onCreatePlaylistButtonClick={onCreatePlaylistButtonClick} />
        </div>
        <div className="main-wrapper">
          <Switch>
            <Route path={LIBRARY}>
              <LibraryView/>
            </Route>
            <Route path={QUEUE}>
              <QueueView/>
            </Route>
            <Route path={SEARCH}>
              <SearchView/>
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
