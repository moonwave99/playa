import React, { ReactElement, FC } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { Playlist } from '../../store/modules/playlist';
import { PLAYLIST_SHOW } from '../../routes';
import './AllPlaylistsView.scss';

type AllPlaylistsViewProps = {
  playlists: Playlist[];
};

export const AllPlaylistsView: FC<AllPlaylistsViewProps> = ({
  playlists = []
}) => {
  function renderListItem(playlist: Playlist): ReactElement {
    const { _id, title } = playlist;
    return (
      <li className="all-playlists-list-item" key={_id}>
        <Link
          title={_id}
          to={generatePath(PLAYLIST_SHOW, { _id })}>
          {title}
        </Link>
      </li>
    );
  }

  return (
		<div className="all-playlists-view">
      <h1>Playlists</h1>
      <ul className="all-playlists-list">{
        playlists.map(renderListItem)
      }</ul>
    </div>
	);
}
