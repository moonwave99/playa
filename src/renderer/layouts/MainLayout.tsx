import React, { ReactElement, useEffect } from 'react';
import { Switch, Route } from 'react-router';
import { generatePath } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SearchView } from '../components/SearchView/SearchView';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { PlaylistContainer } from '../components/PlaylistContainer/PlaylistContainer';
import { history } from '../store/store';
import { requestAllPlaylists } from '../store/modules/playlists';
import './MainLayout.scss';

import {
  SEARCH,
  PLAYLIST_SHOW
} from '../routes';

const MainLayout = (): ReactElement => {
  const showSearch: boolean = useSelector(({ ui }) => ui.showSearch);
  const playlists = useSelector(({ playlists }) =>
    Object.keys(playlists.allById).map(id => playlists.allById[id])
  );
  const mainClasses = ['main-layout'];
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(requestAllPlaylists());
  }, []);

  if (showSearch) {
    mainClasses.push('show-search');
  }

  function onCreatePlaylistButtonClick(): void {
    const now = new Date().toISOString();
    history.replace(generatePath(PLAYLIST_SHOW, { _id: now }));
  }

  return (
    <main className={mainClasses.join(' ')}>
      <section className="main-container">
        <aside className="sidebar-wrapper">
          <Sidebar
            playlists={playlists}
            onCreatePlaylistButtonClick={onCreatePlaylistButtonClick} />
        </aside>
        <div className="playlist-wrapper">
          <Switch>
            <Route path={SEARCH} component={SearchView} />
            <Route path={PLAYLIST_SHOW} component={PlaylistContainer} />
          </Switch>
        </div>
      </section>
    </main>
  );
}

export default MainLayout;
