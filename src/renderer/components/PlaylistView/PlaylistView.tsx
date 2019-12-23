import React, { FC } from 'react';
import { Playlist } from '../../../interfaces';
import './PlaylistView.scss';

type PlaylistViewProps = {
  playlist: Playlist;
};

export const PlaylistView: FC<PlaylistViewProps> = ({ playlist }) => {
	return (
		<div className="playlist-view">
      <h2>{playlist.title}</h2>
    </div>
	);
}
