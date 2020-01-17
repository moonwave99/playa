import React, { FC, ReactElement, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import { PlaybackBar } from './PlaybackBar/PlaybackBar';
import { CoverView } from '../PlaylistView/AlbumView/CoverView/CoverView';
import { ApplicationState } from '../../store/store';
import { togglePlayback, playTrack, seekTo } from '../../store/modules/player';
import { getPrevTrack, getNextTrack } from '../../utils/tracklistUtils';
import Player, { PlaybackInfo, PLAYER_EVENTS } from '../../player';
import './PlayerView.scss';

type PlayerViewProps = {
	player: Player;
}

export const PlayerView: FC<PlayerViewProps> = ({
	player
}): ReactElement => {
	const dispatch = useDispatch();
	const [currentTime, setCurrentTime] = useState(0);
	const {
		currentPlaylist,
    currentAlbum,
    currentTrack,
		currentPlaylistAlbums,
		isPlaying,
		cover
  } = useSelector(({ player, playlists, albums, tracks, covers }: ApplicationState) => {
		const {
			currentPlaylistId,
			currentAlbumId,
			currentTrackId,
			isPlaying
		} = player;
		const currentPlaylist = playlists.allById[currentPlaylistId];
		const currentPlaylistAlbums = currentPlaylist
			? currentPlaylist.albums.map(x => albums.allById[x])
			: [];
		return {
			currentPlaylist,
			currentAlbum: albums.allById[currentAlbumId],
			currentTrack: tracks.allById[currentTrackId],
			currentPlaylistAlbums,
			isPlaying,
			cover: covers.allById[currentAlbumId]
		};
  });

	useEffect(() => {
		function handlePlayerTick({ currentTime }: PlaybackInfo): void {
			setCurrentTime(currentTime);
		}
		function handlePlayerEnded(): void {
			if (!currentAlbum) {
				return;
			}
			dispatch(playTrack({
				playlistId: currentPlaylist._id,
				...getNextTrack(currentTrack._id, currentPlaylistAlbums)
			}));
		}
		player.on(PLAYER_EVENTS.TICK, handlePlayerTick);
		player.on(PLAYER_EVENTS.TRACK_ENDED, handlePlayerEnded);
		return (): void => {
			player.removeListener(PLAYER_EVENTS.TICK, handlePlayerTick);
			player.removeListener(PLAYER_EVENTS.TRACK_ENDED, handlePlayerEnded);
		}
	}, [currentPlaylistAlbums, currentAlbum, currentTrack]);

	function onPlaybackButtonClick(): void {
		dispatch(togglePlayback());
	}

	function onPrevButtonClick(): void {
		if (!currentAlbum) {
			return;
		}
		dispatch(playTrack({
			playlistId: currentPlaylist._id,
			...getPrevTrack(currentTrack._id, currentPlaylistAlbums)
		}));
	}

	function onNextButtonClick(): void {
		if (!currentAlbum) {
			return;
		}
		dispatch(playTrack({
			playlistId: currentPlaylist._id,
			...getNextTrack(currentTrack._id, currentPlaylistAlbums)
		}));
	}

	function onProgressBarClick(position: number): void {
		dispatch(seekTo(position));
		const { currentTime } = player.getPlaybackInfo();
		setCurrentTime(currentTime);
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
				<PlaybackBar
					currentTrack={currentTrack}
					currentAlbum={currentAlbum}
					currentTime={currentTime}
					onProgressBarClick={onProgressBarClick}/>
			}
		</section>
	);
}
