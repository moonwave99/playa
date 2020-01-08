import React, { ReactElement, FC, useState } from 'react';
import { PlaylistViewTitle } from './PlaylistViewTitle/PlaylistViewTitle';
import { AlbumView } from './AlbumView/AlbumView';
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

  function renderAlbum(album: Album): ReactElement {
    return (
      <li key={album._id}>
        <AlbumView album={album}/>
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
          ? <ol className="album-list">{albums.map(renderAlbum)}</ol>
          : <p className="playlist-empty-placeholder">Playlist is empty.</p>
      }
    </div>
	);
}
