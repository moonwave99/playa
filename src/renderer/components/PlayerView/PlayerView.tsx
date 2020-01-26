import React, { FC, ReactElement, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import sha1 from 'sha1';
import { PlaybackBar } from './PlaybackBar/PlaybackBar';
import { CoverView } from '../AlbumListView/AlbumView/CoverView/CoverView';
import {
	playerSelector,
	togglePlayback,
	playTrack,
	seekTo,
	unloadTrack
} from '../../store/modules/player';
import { getWaveformRequest } from '../../store/modules/waveform';
import { getPrevTrack, getNextTrack } from '../../utils/tracklistUtils';
import Player, { PlaybackInfo, PLAYER_EVENTS } from '../../player';

import { QUEUE } from '../../routes';
import { confirmDialog } from '../../lib/dialog';
import './PlayerView.scss';

type PlayerViewProps = {
	player: Player;
	waveformBasePath: string;
}

export const PlayerView: FC<PlayerViewProps> = ({
	player,
	waveformBasePath
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
		cover,
		waveform
  } = useSelector(playerSelector);

	useEffect(() => {
		function handlePlayerUpdate({ currentTime, duration, isPlaying }: PlaybackInfo): void {
			setPlaybackInfo([currentTime, duration]);
			setPlaying(isPlaying);
		}
		function handlePlayerError(_error: Error, info: PlaybackInfo): void {
			confirmDialog({
				title: 'Cannot find track',
				message: `Cannot find track: ${info.currentTrack}`,
				buttons: ['OK']
			});
			dispatch(unloadTrack());
		}
		player.on(PLAYER_EVENTS.PLAY, handlePlayerUpdate);
		player.on(PLAYER_EVENTS.PAUSE, handlePlayerUpdate);
		player.on(PLAYER_EVENTS.TICK, handlePlayerUpdate);
		player.on(PLAYER_EVENTS.ERROR, handlePlayerError);
		return (): void => {
			player.removeListener(PLAYER_EVENTS.PLAY, handlePlayerUpdate);
			player.removeListener(PLAYER_EVENTS.PAUSE, handlePlayerUpdate);
			player.removeListener(PLAYER_EVENTS.TICK, handlePlayerUpdate);
			player.removeListener(PLAYER_EVENTS.ERROR, handlePlayerError);
		}
	}, [player, playbackInfo, isPlaying]);

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
	}, [queue, player, currentPlaylist, currentAlbum, currentTrack]);

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

	function onCoverClick(): void {
		history.replace(QUEUE);
	}

	function onWaveformNotFound(): void {
		dispatch(getWaveformRequest(currentTrack));
	}

	function getWaveformPath(): string {
		if (waveform) {
			return waveform;
		}
		if (!currentTrack) {
			return null;
		}
		return `file://${waveformBasePath}/${sha1(currentTrack._id)}.svg`;
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
			</div>
			<section className="player-album-cover-wrapper">
				<CoverView
					className="player-album-cover"
					src={cover}
					album={currentAlbum}
					onClick={onCoverClick}/>
			</section>
			{ currentTrack && currentAlbum &&
				<PlaybackBar
					currentTrack={currentTrack}
					currentAlbum={currentAlbum}
					currentTime={playbackInfo[0]}
					duration={playbackInfo[1]}
					waveform={getWaveformPath()}
					onWaveformNotFound={onWaveformNotFound}
					onProgressBarClick={onProgressBarClick}/>
			}
		</section>
	);
}
