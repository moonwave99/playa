import React, { FC, ReactElement, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import sha1 from 'sha1';
import { PlaybackBar } from './PlaybackBar/PlaybackBar';
import { VolumeControl } from './VolumeControl/VolumeControl';
import { CoverView } from '../AlbumListView/AlbumView/CoverView/CoverView';
import {
	playerSelector,
	togglePlayback,
	playPreviousTrack,
	playNextTrack,
	seekTo,
	setVolume,
	unloadTrack
} from '../../store/modules/player';
import { getWaveformRequest } from '../../store/modules/waveform';
import { showDialog } from '../../store/modules/ui';

import Player, { PlaybackInfo, PLAYER_EVENTS } from '../../lib/player';

import { QUEUE } from '../../routes';
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
		function handlePlayerUpdate({ isPlaying }: PlaybackInfo): void {
			setPlaying(isPlaying);
		}
		function handlePlayerError(_error: Error, info: PlaybackInfo): void {
			dispatch(
				showDialog(
					'Cannot find track',
					`Cannot find track: ${info.currentTrack}`
				)
			);
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
			dispatch(playNextTrack());
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
		dispatch(playPreviousTrack());
	}

	function onNextButtonClick(): void {
		dispatch(playNextTrack());
	}

	function onProgressBarClick(position: number): void {
		dispatch(seekTo(position));
		const { currentTime, duration } = player.getPlaybackInfo();
		setPlaybackInfo([currentTime, duration]);
	}

	function onCoverClick(): void {
		history.replace(QUEUE);
	}

	function onVolumeChange(volume: number): void {
		dispatch(setVolume(volume));
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

	function renderPlayerControls(): ReactElement {
		return (
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
		);
	}

	const shouldRenderPlaybackBar = currentTrack && currentAlbum;
	const shouldRenderVolumeControl = currentTrack && currentAlbum;

	return (
    <section className="player">
			<div className="player-sidebar-wrapper">
				{renderPlayerControls()}
			</div>
			<section className="player-album-cover-wrapper">
				<CoverView
					className="player-album-cover"
					src={cover}
					album={currentAlbum}
					onClick={onCoverClick}/>
			</section>
			{ shouldRenderPlaybackBar &&
				<PlaybackBar
					currentTrack={currentTrack}
					currentAlbum={currentAlbum}
					player={player}
					waveform={getWaveformPath()}
					onWaveformNotFound={onWaveformNotFound}
					onProgressBarClick={onProgressBarClick}/>
			}
			{ shouldRenderVolumeControl &&
				<VolumeControl
					initialVolume={player.getVolume() * 100}
					onVolumeChange={onVolumeChange}/>
			}
		</section>
	);
}
