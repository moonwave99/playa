import React, { FC } from 'react';
import { Playlist } from '../../store/modules/playlist';
import { Album } from '../../store/modules/album';
import './EditPlaylistView.scss';

type EditPlaylistViewProps = {
  albums: Album[];
  playlist: Playlist;
};

export const EditPlaylistView: FC<EditPlaylistViewProps> = ({
  albums = [],
  playlist
}) => {
	return (
    <div className="edit-playlist-view">
      <h1>{playlist.title}</h1>
    </div>
	);
}
