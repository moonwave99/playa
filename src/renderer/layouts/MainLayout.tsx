import React, { ReactElement } from 'react';
import { connect, useSelector } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import { SearchView } from '../components/SearchView/SearchView';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { PlaylistView } from '../components/PlaylistView/PlaylistView';
import { Playlist } from '../../interfaces';
import { hideSearch } from '../store/modules/ui';
import { createPlaylist, loadPlaylist } from '../store/modules/playlists';
import './MainLayout.scss';

interface MainLayoutProps {
  createPlaylist: Function;
  loadPlaylist: Function;
  hideSearch: Function;
}

const MainLayout = ({
  createPlaylist,
  loadPlaylist,
  hideSearch
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
    hideSearch();
  }

  function onPlaylistClick(playlist: Playlist): void {
    loadPlaylist(playlist);
    hideSearch();
  }

  return (
    <main className={mainClasses.join(' ')}>
      <section className="main-container">
        <aside className="sidebar-wrapper">
          <Sidebar
            playlists={playlists}
            currentPlaylist={currentPlaylist}
            onCreatePlaylistButtonClick={onCreatePlaylistButtonClick}
            onPlaylistClick={onPlaylistClick} />
        </aside>
        <div className="playlist-wrapper">
          { currentPlaylist
            ? <PlaylistView playlist={currentPlaylist}/>
            : null
          }
        </div>
      </section>
      <CSSTransition
        in={showSearch}
        timeout={300}
        classNames="search-container"
        unmountOnExit>
          <section className="search-container">
            <SearchView/>
          </section>
      </CSSTransition>
    </main>
  );
}

export default connect(null, {
  createPlaylist,
  loadPlaylist,
  hideSearch
})(MainLayout);
