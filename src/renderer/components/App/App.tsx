import React, { ReactElement, useEffect } from 'react';
import { Switch, Route } from 'react-router';
import { generatePath } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PlayerView } from '../PlayerView/PlayerView';
import { SearchView } from '../SearchView/SearchView';
import { SidebarView } from '../SidebarView/SidebarView';
import { AllPlaylistContainer } from '../AllPlaylistContainer/AllPlaylistContainer';
import { PlaylistContainer } from '../PlaylistContainer/PlaylistContainer';
import { history } from '../../store/store';
import { Playlist, getAllPlaylistsRequest } from '../../store/modules/playlist';
import './App.scss';

import {
  SEARCH,
  PLAYLIST_ALL,
  PLAYLIST_SHOW
} from '../../routes';

import {
  RECENT_PLAYLIST_COUNT
} from '../../../constants';

type MainLayoutProps = {
  lastOpenedPlaylistId: Playlist['_id'];
}

const MainLayout = ({
  lastOpenedPlaylistId
}: MainLayoutProps): ReactElement => {
  const dispatch = useDispatch();
  const playlists = useSelector(({ playlists }) =>
    Object.keys(playlists.allById)
      .map(id => playlists.allById[id])
      .sort((a: Playlist, b: Playlist) =>
        new Date(b.accessed).getTime() - new Date(a.accessed).getTime()
      ).slice(0, RECENT_PLAYLIST_COUNT)
  );

  useEffect(() => {
    dispatch(getAllPlaylistsRequest());
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
      <section className="main-container">
        <div className="sidebar-wrapper">
          <SidebarView
            playlists={playlists}
            onCreatePlaylistButtonClick={onCreatePlaylistButtonClick} />
        </div>
        <div className="main-wrapper">
          <Switch>
            <Route path={SEARCH} component={SearchView} />
            <Route path={PLAYLIST_ALL} exact component={AllPlaylistContainer} />
            <Route path={PLAYLIST_SHOW} component={PlaylistContainer} />
          </Switch>
        </div>
      </section>
      <section className="player-wrapper">
        <PlayerView/>
      </section>
    </main>
  );
}

export default MainLayout;
