import React, { FC, ReactElement, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { PlaybackBar } from './PlaybackBar/PlaybackBar';
import { CoverView } from '../AlbumListView/AlbumView/CoverView/CoverView';
import { playerSelector, togglePlayback, playTrack, seekTo } from '../../store/modules/player';
import { getPrevTrack, getNextTrack } from '../../utils/tracklistUtils';
import Player, { PlaybackInfo, PLAYER_EVENTS } from '../../player';
import { QUEUE } from '../../routes';
import './PlayerView.scss';

type PlayerViewProps = {
	player: Player;
}

export const PlayerView: FC<PlayerViewProps> = ({
	player
}): ReactElement => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [playbackInfo, setPlaybackInfo] = useState([0, 0]);
	const [isPlaying, setPlaying] = useState(false);
	const {
		currentPlaylist,
    currentAlbum,
    currentTrack,
		queue,
		cover
  } = useSelector(playerSelector);

	useEffect(() => {
		function handlePlayerUpdate({ currentTime, duration, isPlaying }: PlaybackInfo): void {
			setPlaybackInfo([currentTime, duration]);
			setPlaying(isPlaying);
		}
		player.on(PLAYER_EVENTS.PLAY, handlePlayerUpdate);
		player.on(PLAYER_EVENTS.PAUSE, handlePlayerUpdate);
		player.on(PLAYER_EVENTS.TICK, handlePlayerUpdate);
		return (): void => {
			player.removeListener(PLAYER_EVENTS.PLAY, handlePlayerUpdate);
			player.removeListener(PLAYER_EVENTS.PAUSE, handlePlayerUpdate);
			player.removeListener(PLAYER_EVENTS.TICK, handlePlayerUpdate);
		}
	}, [playbackInfo, isPlaying]);

	useEffect(() => {
		function handlePlayerEnded(): void {
			const { albumId, trackId } = getNextTrack(currentTrack._id, queue);
			if (albumId && trackId ) {
				dispatch(playTrack({
					playlistId: currentPlaylist ? currentPlaylist._id : null,
					albumId,
					trackId
				}));
			}
		}
		player.on(PLAYER_EVENTS.TRACK_ENDED, handlePlayerEnded);
		return (): void => {
			player.removeListener(PLAYER_EVENTS.TRACK_ENDED, handlePlayerEnded);
		}
	}, [queue, currentAlbum, currentTrack]);

	function onPlaybackButtonClick(): void {
		dispatch(togglePlayback());
	}

	function onPrevButtonClick(): void {
		if (!currentAlbum) {
			return;
		}
		const { albumId, trackId } = getPrevTrack(currentTrack._id, queue);
		if (albumId && trackId ) {
			dispatch(playTrack({
				playlistId: currentPlaylist ? currentPlaylist._id : null,
				albumId,
				trackId
			}));
		}
	}

	function onNextButtonClick(): void {
		if (!currentAlbum) {
			return;
		}
		const { albumId, trackId } = getNextTrack(currentTrack._id, queue);
		if (albumId && trackId ) {
			dispatch(playTrack({
				playlistId: currentPlaylist ? currentPlaylist._id : null,
				albumId,
				trackId
			}));
		}
	}

	function onProgressBarClick(position: number): void {
		dispatch(seekTo(position));
		const { currentTime, duration } = player.getPlaybackInfo();
		setPlaybackInfo([currentTime, duration]);
	}

	function onCoverClick(): void{
		history.replace(QUEUE);
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
					<button className="control control-prev" onClick={onPrevButtonClick}>
						<FontAwesomeIcon icon="step-backward" fixedWidth/>
					</button>
					<button className={playbackButtonClasses} onClick={onPlaybackButtonClick}>
						<FontAwesomeIcon icon={isPlaying ? 'pause' : 'play'} fixedWidth/>
					</button>
					<button className="control control-next" onClick={onNextButtonClick}>
						<FontAwesomeIcon icon="step-forward" fixedWidth/>
					</button>
				</section>
				<section className="player-album-cover-wrapper">
					<CoverView
						className="player-album-cover"
						src={cover}
						album={currentAlbum}
						onClick={onCoverClick}/>
				</section>
			</div>
			{ currentTrack && currentAlbum &&
				<PlaybackBar
					currentTrack={currentTrack}
					currentAlbum={currentAlbum}
					currentTime={playbackInfo[0]}
					duration={playbackInfo[1]}
					onProgressBarClick={onProgressBarClick}/>
			}
		</section>
	);
}
