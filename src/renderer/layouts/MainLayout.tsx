import React, { ReactElement } from 'react';
import { connect, useSelector } from 'react-redux';
import { SearchView } from '../components/SearchView/SearchView';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { PlaylistView } from '../components/PlaylistView/PlaylistView';
import { Playlist } from '../../interfaces';
import { createPlaylist, loadPlaylist } from '../store/modules/playlists';
import './MainLayout.scss';

interface MainLayoutProps {
  createPlaylist: Function;
  loadPlaylist: Function;
}

const MainLayout = ({
  createPlaylist,
  loadPlaylist
}: MainLayoutProps): ReactElement => {
  const showSearch: boolean = useSelector(({ ui }) => ui.showSearch);
  const playlists: Array<Playlist> = useSelector(({ playlists }) => playlists.all);
  const currentPlaylist: Playlist = useSelector(({ playlists }) => playlists.current);
  const mainClasses = ['main-layout'];

  if (showSearch) {
    mainClasses.push('show-search');
  }

  return (
    <main className={mainClasses.join(' ')}>
      <section className="search-container">
        <SearchView/>
      </section>
      <section className="main-container">
        <aside className="sidebar-wrapper">
          <Sidebar
            playlists={playlists}
            createPlaylist={createPlaylist}
            currentPlaylist={currentPlaylist}
            loadPlaylist={loadPlaylist} />
        </aside>
        <div className="playlist-wrapper">
          { currentPlaylist
            ? <PlaylistView playlist={currentPlaylist}/>
            : null
          }
        </div>
      </section>
    </main>
  );
}

export default connect(null, {
  createPlaylist,
  loadPlaylist
})(MainLayout);
