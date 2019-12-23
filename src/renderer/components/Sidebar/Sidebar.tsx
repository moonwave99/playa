import React, { FC, ReactElement, SyntheticEvent } from 'react';
import { Playlist } from '../../../interfaces';
import './Sidebar.scss';

type SidebarProps = {
  createPlaylist: Function;
  loadPlaylist: Function;
  playlists: Array<Playlist>;
};

export const Sidebar: FC<SidebarProps> = ({ createPlaylist, loadPlaylist, playlists = [] }) => {
  function onButtonClick(): void {
    createPlaylist();
  }

  function renderListItem(playlist: Playlist): ReactElement {
    function onItemListClick(event: SyntheticEvent): void {
      event.preventDefault();
      loadPlaylist(playlist);
    }
    return (
      <li key={playlist._id}>
        <a href="#" onClick={onItemListClick}>{playlist.title}</a>
      </li>
    );
  }

	return (
		<div className="sidebar">
      <button type="button" className="button-primary" onClick={onButtonClick}>Create Playlist</button>
      <ul>{
        playlists.map(renderListItem)
      }</ul>
    </div>
	);
}
