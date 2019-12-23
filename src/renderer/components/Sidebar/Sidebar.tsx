import React, { FC, ReactElement, SyntheticEvent } from 'react';
import { Playlist } from '../../../interfaces';
import './Sidebar.scss';

type SidebarProps = {
  playlists: Array<Playlist>;
  currentPlaylist: Playlist;
  onCreatePlaylistButtonClick: Function;
  onPlaylistClick: Function;
};

export const Sidebar: FC<SidebarProps> = ({
  currentPlaylist,
  playlists = [],
  onCreatePlaylistButtonClick,
  onPlaylistClick
}) => {
  function onButtonClick(): void {
    onCreatePlaylistButtonClick();
  }

  function renderListItem(playlist: Playlist): ReactElement {
    function onItemListClick(event: SyntheticEvent): void {
      event.preventDefault();
      onPlaylistClick(playlist);
    }
    const playlistClasses = ['playlist'];
    if (currentPlaylist._id === playlist._id) {
      playlistClasses.push('current');
    }
    return (
      <li key={playlist._id} className={playlistClasses.join(' ')}>
        <a href="#" onClick={onItemListClick}>{playlist.title}</a>
      </li>
    );
  }

	return (
		<div className="sidebar">
      <div className="header">
        <button type="button" className="button button-primary" onClick={onButtonClick}>Create Playlist</button>
      </div>
      <ul className="playlist-list">{
        playlists.map(renderListItem)
      }</ul>
    </div>
	);
}
