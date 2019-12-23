import React, { ReactElement } from 'react';
import { connect, useSelector } from 'react-redux';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { PlaylistView } from '../components/PlaylistView/PlaylistView';
import { Playlist } from '../../interfaces';
import { createPlaylist, loadPlaylist } from '../store/modules/playlists';
import './MainLayout.scss';

interface MainLayoutProps {
  createPlaylist: Function;
  loadPlaylist: Function;
}

const MainLayout = ({ createPlaylist, loadPlaylist }: MainLayoutProps): ReactElement => {
  const playlists: Array<Playlist> = useSelector(({ playlists }) => playlists.all);
  const currentPlaylist: Playlist = useSelector(({ playlists }) => playlists.current);

  return (
    <div className="main-layout row">
      <aside className="sidebar-wrapper column column-20">
        <Sidebar
          playlists={playlists}
          createPlaylist={createPlaylist}
          loadPlaylist={loadPlaylist} />
      </aside>
      <main className="main-wrapper column column-90">
        { currentPlaylist
          ? <PlaylistView playlist={currentPlaylist}/>
          : null
        }
      </main>
    </div>
  );
}

export default connect(null, {
  createPlaylist,
  loadPlaylist
})(MainLayout);
