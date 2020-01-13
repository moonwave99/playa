import React, { ReactElement, FC } from 'react';
import { PlaylistViewTitle } from './PlaylistViewTitle/PlaylistViewTitle';
import { AlbumView } from './AlbumView/AlbumView';
import { Playlist } from '../../store/modules/playlist';
import { Album } from '../../store/modules/album';
import './PlaylistView.scss';

type PlaylistViewProps = {
  albums: Album[];
  playlist: Playlist;
  onTitleChange: Function;
};

export const PlaylistView: FC<PlaylistViewProps> = ({
  albums,
  playlist,
  onTitleChange
}) => {

  function renderAlbum(album: Album): ReactElement {
    return (
      <li key={album._id}>
        <AlbumView album={album}/>
      </li>
    );
  }

	return (
		<div className="playlist-view">
      <header className="playlist-header">
        <PlaylistViewTitle
          playlist={playlist}
          onTitleChange={onTitleChange}/>
      </header>
      {
        albums.length > 0
          ? <ol className="album-list">{albums.map(renderAlbum)}</ol>
          : <p className="playlist-empty-placeholder">Playlist is empty.</p>
      }
    </div>
	);
}
