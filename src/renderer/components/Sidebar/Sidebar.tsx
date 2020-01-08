import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { PlaylistList } from './PlaylistList/PlaylistList';
import { Playlist } from '../../store/modules/playlist';
import './Sidebar.scss';
import { SEARCH } from '../../routes';

type SidebarProps = {
  playlists: Playlist[];
  onCreatePlaylistButtonClick: Function;
};

export const Sidebar: FC<SidebarProps> = ({
  playlists = [],
  onCreatePlaylistButtonClick
}) => {
  function onButtonClick(): void {
    onCreatePlaylistButtonClick();
  }

	return (
		<div className="sidebar">
      <div className="sidebar-header">
        <Link to={SEARCH} className="button button-primary">Search</Link>
      </div>
      <PlaylistList playlists={playlists}/>
      <div className="sidebar-footer">
        <button type="button" className="button button-primary" onClick={onButtonClick}>
          Create Playlist
        </button>
      </div>
    </div>
	);
}
