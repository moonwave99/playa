import React, { ReactElement, useEffect } from 'react';
import { Switch, Route } from 'react-router';
import { generatePath } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PlayerView } from '../components/PlayerView/PlayerView';
import { SearchView } from '../components/SearchView/SearchView';
import { SidebarView } from '../components/SidebarView/SidebarView';
import { AllPlaylistContainer } from '../components/AllPlaylistContainer/AllPlaylistContainer';
import { PlaylistContainer } from '../components/PlaylistContainer/PlaylistContainer';
import { history } from '../store/store';
import { Playlist, getAllPlaylistsRequest } from '../store/modules/playlist';
import './MainLayout.scss';

import {
  SEARCH,
  PLAYLIST_ALL,
  PLAYLIST_SHOW
} from '../routes';

import {
  RECENT_PLAYLIST_COUNT
} from '../../constants';

type MainLayoutProps = {
  currentPlaylistId: Playlist['_id'];
}

const MainLayout = ({
  currentPlaylistId
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
    if (currentPlaylistId) {
      history.replace(generatePath(PLAYLIST_SHOW, { _id: currentPlaylistId }));
    }
  }, [currentPlaylistId]);

  function onCreatePlaylistButtonClick(): void {
    const now = new Date().toISOString();
    history.replace(generatePath(PLAYLIST_SHOW, { _id: now }));
  }

  return (
    <main className="main-layout">
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
          <PlayerView/>
        </div>
      </section>
    </main>
  );
}

export default MainLayout;
