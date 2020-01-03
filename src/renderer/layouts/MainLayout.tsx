import React, { ReactElement } from 'react';
import { Switch, Route } from 'react-router';
import { connect, useSelector } from 'react-redux';
import { SearchView } from '../components/SearchView/SearchView';
import { Sidebar } from '../components/Sidebar/Sidebar';
import PlaylistView from '../components/PlaylistView/PlaylistView';
import { Playlist } from '../../interfaces';
import { createPlaylist } from '../store/modules/playlists';
import './MainLayout.scss';

import { SEARCH, PLAYLIST } from '../routes';

interface MainLayoutProps {
  createPlaylist: Function;
}

const MainLayout = ({
  createPlaylist
}: MainLayoutProps): ReactElement => {
  const showSearch: boolean = useSelector(({ ui }) => ui.showSearch);
  const playlists: Array<Playlist> = useSelector(({ playlists }) => playlists.all);
  const currentPlaylist: Playlist = useSelector(({ playlists }) => playlists.current);
  const mainClasses = ['main-layout'];

  if (showSearch) {
    mainClasses.push('show-search');
  }

  function onCreatePlaylistButtonClick(): void {
    createPlaylist();
  }

  return (
    <main className={mainClasses.join(' ')}>
      <section className="main-container">
        <aside className="sidebar-wrapper">
          <Sidebar
            playlists={playlists}
            currentPlaylist={currentPlaylist}
            onCreatePlaylistButtonClick={onCreatePlaylistButtonClick} />
        </aside>
        <div className="playlist-wrapper">
          <Switch>
            <Route path={SEARCH} component={SearchView} />
            <Route path={`${PLAYLIST}`} component={PlaylistView} />
          </Switch>
        </div>
      </section>
    </main>
  );
}

export default connect(null, {
  createPlaylist
})(MainLayout);
