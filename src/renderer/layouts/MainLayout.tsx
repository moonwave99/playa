import React, { ReactElement, useEffect } from 'react';
import { Switch, Route } from 'react-router';
import { generatePath } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  PLAYLIST_SHOW,
  PLAYLIST_EDIT
} from '../routes';

import {
  RECENT_PLAYLIST_COUNT
} from '../../constants';

const MainLayout = (): ReactElement => {
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

  function onCreatePlaylistButtonClick(): void {
    const now = new Date().toISOString();
    history.replace(generatePath(PLAYLIST_SHOW, { _id: now }));
  }

  return (
    <main className="main-layout">
      <section className="main-container">
        <aside className="sidebar-wrapper">
          <SidebarView
            playlists={playlists}
            onCreatePlaylistButtonClick={onCreatePlaylistButtonClick} />
        </aside>
        <section className="playlist-wrapper">
          <Switch>
            <Route path={SEARCH} component={SearchView} />
            <Route path={PLAYLIST_ALL} exact component={AllPlaylistContainer} />
            <Route path={PLAYLIST_SHOW} component={PlaylistContainer} />
            <Route path={PLAYLIST_EDIT} component={PlaylistContainer} />
          </Switch>
        </section>
      </section>
    </main>
  );
}

export default MainLayout;
