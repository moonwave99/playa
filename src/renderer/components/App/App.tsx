import React, { FC, ReactElement, useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router';
import { generatePath } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Player from '../../player';
import { PlayerView } from '../PlayerView/PlayerView';
import { SearchView } from '../SearchView/SearchView';
import { SidebarView } from '../SidebarView/SidebarView';
import { AllPlaylistContainer } from '../AllPlaylistContainer/AllPlaylistContainer';
import { PlaylistContainer } from '../PlaylistContainer/PlaylistContainer';

import initIpc from '../../lib/initIpc';
import { Playlist, getAllPlaylistsRequest } from '../../store/modules/playlist';
import { togglePlayback } from '../../store/modules/player';
import './App.scss';

import {
  SEARCH,
  PLAYLIST_ALL,
  PLAYLIST_SHOW
} from '../../routes';

import {
  RECENT_PLAYLIST_COUNT
} from '../../../constants';

type AppProps = {
  player: Player;
  lastOpenedPlaylistId: Playlist['_id'];
}

export const App: FC<AppProps> = ({
  player,
  lastOpenedPlaylistId
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

  useEffect(() => {
    initIpc(history, dispatch);
    dispatch(getAllPlaylistsRequest());
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
          if (event.target.dataset.keyCatch !== 'Space') {
            dispatch(togglePlayback());
            event.preventDefault();
          }
          break;
      }
    }, true);
  }, []);

  useEffect(() => {
    if (lastOpenedPlaylistId) {
      history.replace(generatePath(PLAYLIST_SHOW, { _id: lastOpenedPlaylistId }));
    }
  }, [lastOpenedPlaylistId]);

  function onCreatePlaylistButtonClick(): void {
    const now = new Date().toISOString();
    history.replace(generatePath(PLAYLIST_SHOW, { _id: now }));
  }

  return (
    <main className="app">
      <div className="main-container">
        <div className="sidebar-wrapper">
          <SidebarView
            currentPlaylistId={currentPlaylistId}
            recentPlaylists={recentPlaylists}
            onCreatePlaylistButtonClick={onCreatePlaylistButtonClick} />
        </div>
        <div className="main-wrapper">
          <Switch>
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
        <PlayerView player={player}/>
      </div>
    </main>
  );
}
