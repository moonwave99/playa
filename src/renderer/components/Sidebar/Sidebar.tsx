import React, { FC, ReactElement } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { Playlist } from '../../../interfaces';
import './Sidebar.scss';
import { PLAYLIST, SEARCH } from '../../routes';

type SidebarProps = {
  playlists: Array<Playlist>;
  currentPlaylist: Playlist;
  onCreatePlaylistButtonClick: Function;
};

export const Sidebar: FC<SidebarProps> = ({
  currentPlaylist,
  playlists = [],
  onCreatePlaylistButtonClick
}) => {
  function onButtonClick(): void {
    onCreatePlaylistButtonClick();
  }

  function renderListItem(playlist: Playlist): ReactElement {
    const playlistClasses = ['playlist'];
    if (currentPlaylist._id === playlist._id) {
      playlistClasses.push('current');
    }
    return (
      <li key={playlist._id} className={playlistClasses.join(' ')}>
        <Link
          to={generatePath(PLAYLIST, { id: playlist._id })}
          className="playlist-item">{playlist.title}</Link>
      </li>
    );
  }

	return (
		<div className="sidebar">
      <div className="header">
        <p>
          <Link to={SEARCH} className="button button-primary">Search</Link>
        </p>
        <button type="button" className="button button-primary" onClick={onButtonClick}>Create Playlist</button>
      </div>
      <ul className="playlist-list">{
        playlists.map(renderListItem)
      }</ul>
    </div>
	);
}
