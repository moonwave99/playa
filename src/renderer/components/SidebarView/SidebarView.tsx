import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SidebarPlaylistList } from './SidebarPlaylistList/SidebarPlaylistList';
import { Playlist } from '../../store/modules/playlist';
import './SidebarView.scss';
import {
	QUEUE,
	SEARCH,
	PLAYLIST_ALL
} from '../../routes';

type SidebarViewProps = {
	recentPlaylists: Playlist[];
	currentPlaylistId: Playlist['_id'];
	onCreatePlaylistButtonClick: Function;
};

export const SidebarView: FC<SidebarViewProps> = ({
	recentPlaylists = [],
	currentPlaylistId,
	onCreatePlaylistButtonClick
}) => {

	function _onCreatePlaylistButtonClick(): void {
		onCreatePlaylistButtonClick();
	}

	return (
		<aside className="sidebar">
			<section className="sidebar-header">
				<div className="button-wrapper">
					<Link to={SEARCH} className="button button-primary">
						<FontAwesomeIcon icon="search" className="button-icon"/>
						<span className="button-text">Search</span>
					</Link>
					<Link to={QUEUE} className="button button-outline">
						<FontAwesomeIcon icon="music" className="button-icon"/>
						<span className="button-text">Playback Queue</span>
					</Link>
				</div>
			</section>
			<section className="sidebar-footer">
				<SidebarPlaylistList playlists={recentPlaylists} currentPlaylistId={currentPlaylistId}/>
				<div className="button-wrapper">
					<button type="button" className="button button-primary" onClick={_onCreatePlaylistButtonClick}>
						<FontAwesomeIcon icon="plus" className="button-icon"/>
						<span className="button-text">New Playlist</span>
					</button>
					<Link to={PLAYLIST_ALL} className="button button-outline">
						<FontAwesomeIcon icon="list" className="button-icon"/>
						<span className="button-text">All Playlists</span>
					</Link>
				</div>
			</section>
		</aside>
	);
}
