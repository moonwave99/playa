import React, { FC, useState } from 'react';
import { PlaylistViewTitle } from './PlaylistViewTitle/PlaylistViewTitle';
import { Playlist } from '../../store/modules/playlist';
import './PlaylistView.scss';

type PlaylistViewProps = {
  playlist: Playlist;
  savePlaylist: Function;
  deletePlaylist: Function;
};

export const PlaylistView: FC<PlaylistViewProps> = ({ playlist, savePlaylist, deletePlaylist }) => {
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
    </div>
	);
}
