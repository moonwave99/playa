import React, { ReactElement, SyntheticEvent, FC } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { Playlist } from '../../store/modules/playlist';
import { formatDate } from '../../utils/datetimeUtils';
import { PLAYLIST_SHOW } from '../../routes';
import './AllPlaylistsView.scss';

type AllPlaylistsViewProps = {
  playlists: Playlist[];
  onPlaylistDelete: Function;
};

export const AllPlaylistsView: FC<AllPlaylistsViewProps> = ({
  playlists = [],
  onPlaylistDelete
}) => {
  function renderTableRow(playlist: Playlist): ReactElement {
    const { _id, title, created, accessed } = playlist;

    function onDeleteButtonClick(event: SyntheticEvent): void {
      event.preventDefault();
      onPlaylistDelete(playlist);
    }

    return (
      <tr key={_id}>
        <td>
          <Link
            title={_id}
            to={generatePath(PLAYLIST_SHOW, { _id })}>
            {title}
          </Link>
        </td>
        <td>{formatDate(created)}</td>
        <td>{formatDate(accessed)}</td>
        <td><a href="#" onClick={onDeleteButtonClick}>Delete</a></td>
      </tr>
    );
  }

  return (
		<div className="all-playlists-view">
      <h1>Playlists</h1>
      <table className="all-playlists-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Created on</th>
            <th>Last accessed</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{playlists.map(renderTableRow)}</tbody>
      </table>
    </div>
	);
}
