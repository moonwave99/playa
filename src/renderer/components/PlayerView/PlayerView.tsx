import React, { ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import { PlaybackBar } from './PlaybackBar/PlaybackBar';
import { CoverView } from '../PlaylistView/AlbumView/CoverView/CoverView';
import { ApplicationState } from '../../store/store';
import { togglePlayback, prevTrack, nextTrack } from '../../store/modules/player';
import './PlayerView.scss';

// #TODO:
// 2. peek at old proj
// 3. consider UI switch to icon circles on top right + sidebar from right
export const PlayerView = (): ReactElement => {
	const dispatch = useDispatch();
	const {
    currentAlbum,
    currentTrack,
		isPlaying,
		cover
  } = useSelector((state: ApplicationState) => {
		const {
			currentAlbumId,
			currentTrackId,
			isPlaying
		} = state.player;
		return {
			isPlaying,
			currentAlbum: state.albums.allById[currentAlbumId],
			currentTrack: state.tracks.allById[currentTrackId],
			cover: state.covers.allById[currentAlbumId]
		};
  });

	function onPlaybackButtonClick(): void {
		dispatch(togglePlayback());
	}

	function onPrevButtonClick(): void {
		dispatch(prevTrack());
	}

	function onNextButtonClick(): void {
		dispatch(nextTrack());
	}

	const playbackButtonClasses = cx(
		'control',
		'control-playback',
		{ 'is-playing': isPlaying}
	);

	return (
    <section className="player">
			<div className="player-sidebar-wrapper">
				<section className="player-controls">
					<button className="control control-prev" onClick={onPrevButtonClick}/>
					<button className={playbackButtonClasses} onClick={onPlaybackButtonClick}/>
					<button className="control control-next" onClick={onNextButtonClick}/>
				</section>
				<section className="player-album-cover-wrapper">
					<CoverView
						className="player-album-cover"
						src={cover}
						album={currentAlbum}/>
				</section>
			</div>
			{ currentTrack && currentAlbum &&
				<PlaybackBar currentTrack={currentTrack} currentAlbum={currentAlbum}/>
			}
		</section>
	);
}
