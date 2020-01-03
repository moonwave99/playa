import React, { FC } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Playlist } from '../../../interfaces';
import { ApplicationState } from '../../store/store';
import './PlaylistView.scss';

type PlaylistViewProps = {
  playlist: Playlist;
};

interface MatchParams {
  id: Playlist['_id'];
}

const PlaylistView: FC<PlaylistViewProps> = ({ playlist }) => {
	return (
		<div className="playlist-view">
      { playlist
        ? <h2>{playlist.title}</h2>
        : null }
    </div>
	);
}

const mapStateToProps = (state: ApplicationState, ownProps: RouteComponentProps<MatchParams>): PlaylistViewProps => {
  console.log(ownProps, typeof ownProps)
  const id = ownProps.match.params.id;
  return {
    playlist: state.playlists.all.find(({ _id }) => _id === id)
  }
};

export default connect(mapStateToProps)(PlaylistView);
