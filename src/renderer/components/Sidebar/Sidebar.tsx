import React, { FC, ReactElement, SyntheticEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import { Playlist, loadPlaylist } from '../../store/modules/playlist';
import './Sidebar.scss';
import { PLAYLIST_SHOW, SEARCH } from '../../routes';

type SidebarProps = {
  playlists: Array<Playlist>;
  onCreatePlaylistButtonClick: Function;
};

export const Sidebar: FC<SidebarProps> = ({
  playlists = [],
  onCreatePlaylistButtonClick
}) => {
  const dispatch = useDispatch();
  const currentPlaylist: Playlist = useSelector(({ playlists }) => playlists.current) || {};
  function onButtonClick(): void {
    onCreatePlaylistButtonClick();
  }
  function renderListItem(playlist: Playlist): ReactElement {
    const playlistClasses = ['playlist'];
    if (currentPlaylist._id === playlist._id) {
      playlistClasses.push('current');
    }
    function onPlaylistItemClick(event: SyntheticEvent): void {
      if (currentPlaylist._id !== playlist._id) {
        dispatch(loadPlaylist(playlist._id));
      } else {
        event.preventDefault();
      }
    }
    return (
      <li key={playlist._id} className={playlistClasses.join(' ')}>
        <Link
          onClick={onPlaylistItemClick}
          title={playlist._id}
          to={generatePath(PLAYLIST_SHOW, { _id: playlist._id })}
          className="playlist-item">{playlist.title}</Link>
      </li>
    );
  }

	return (
		<div className="sidebar">
      <div className="sidebar-header">
        <Link to={SEARCH} className="button button-primary">Search</Link>
      </div>
      <ul className="playlist-list">{ playlists.map(renderListItem) }</ul>
      <div className="sidebar-footer">
        <button type="button" className="button button-primary" onClick={onButtonClick}>
          Create Playlist
        </button>
      </div>
    </div>
	);
}
