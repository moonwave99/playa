import React, { ReactElement, FC, useState } from 'react';
import { PlaylistViewTitle } from './PlaylistViewTitle/PlaylistViewTitle';
import { Playlist } from '../../store/modules/playlist';
import { Album } from '../../store/modules/album';
import './PlaylistView.scss';

type PlaylistViewProps = {
  albums: Album[];
  playlist: Playlist;
  savePlaylist: Function;
  deletePlaylist: Function;
};

export const PlaylistView: FC<PlaylistViewProps> = ({
  albums,
  playlist,
  savePlaylist,
  deletePlaylist
}) => {
  const [isTitleEditing, setTitleEditing] = useState(false);

  function onDeleteButtonClick(): void {
    deletePlaylist();
  }

  function onViewClick(): void {
    setTitleEditing(false);
  }

  function onTitleClick(): void {
    setTitleEditing(true);
  }

  function onFormSubmit(title: Playlist['title']): void {
    savePlaylist({ ...playlist, title });
    setTitleEditing(false);
  }

  function renderAlbum({ _id, type, year, artist, title }: Album): ReactElement {
    return (
      <li key={_id}>
        <span>{type}</span>
        <span className="year">{year ? year : '-'}</span>
        <span className="artist">{artist}</span>
        <span className="title">{title}</span>
      </li>
    );
  }

	return (
		<div className="playlist-view" onClick={onViewClick}>
      <header className="playlist-header">
        <PlaylistViewTitle
          playlist={playlist}
          isTitleEditing={isTitleEditing}
          onTitleClick={onTitleClick}
          onFormSubmit={onFormSubmit}/>
        <div className="playlist-header-actions">
          <button type="button"
            className="button button-primary"
            onClick={onDeleteButtonClick}
            disabled={!playlist._rev}>
            Delete Playlist
          </button>
        </div>
      </header>
      {
        albums.length > 0
          ? <ul>{albums.map(renderAlbum)}</ul>
          : <p className="playlist-empty-placeholder">Playlist is empty.</p>
      }
    </div>
	);
}
