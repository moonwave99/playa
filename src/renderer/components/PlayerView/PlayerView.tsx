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
	const [playbackInfo, setPlaybackInfo] = useState([0, 0]);
	const [isPlaying, setPlaying] = useState(false);
	const {
		currentPlaylist,
    currentAlbum,
    currentTrack,
		currentPlaylistAlbums,
		cover
  } = useSelector(({ player, playlists, albums, tracks, covers }: ApplicationState) => {
		const {
			currentPlaylistId,
			currentAlbumId,
			currentTrackId
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
			const { albumId, trackId } = getNextTrack(currentTrack._id, currentPlaylistAlbums);
			if (albumId && trackId ) {
				dispatch(playTrack({
					playlistId: currentPlaylist._id,
					albumId,
					trackId
				}));
			}
		}
		player.on(PLAYER_EVENTS.TRACK_ENDED, handlePlayerEnded);
		return (): void => {
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
		const { albumId, trackId } = getPrevTrack(currentTrack._id, currentPlaylistAlbums);
		if (albumId && trackId ) {
			dispatch(playTrack({
				playlistId: currentPlaylist._id,
				albumId,
				trackId
			}));
		}
	}

	function onNextButtonClick(): void {
		if (!currentAlbum) {
			return;
		}
		const { albumId, trackId } = getNextTrack(currentTrack._id, currentPlaylistAlbums);
		if (albumId && trackId ) {
			dispatch(playTrack({
				playlistId: currentPlaylist._id,
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
					currentTime={playbackInfo[0]}
					duration={playbackInfo[1]}
					onProgressBarClick={onProgressBarClick}/>
			}
		</section>
	);
}
