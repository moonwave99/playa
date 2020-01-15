import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SidebarPlaylistList } from './SidebarPlaylistList/SidebarPlaylistList';
import { Playlist } from '../../store/modules/playlist';
import './SidebarView.scss';
import { PLAYLIST_ALL } from '../../routes';

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
			<SidebarPlaylistList playlists={recentPlaylists} currentPlaylistId={currentPlaylistId}/>
			<footer className="sidebar-footer">
				<button type="button" className="button button-primary" onClick={_onCreatePlaylistButtonClick}>
					<FontAwesomeIcon icon="plus" className="button-icon"/>
					<span className="button-text">Create Playlist</span>
        </button>
				<Link to={PLAYLIST_ALL} className="button button-outline">
					<FontAwesomeIcon icon="list" className="button-icon"/>
					<span className="button-text">All Playlists</span>
				</Link>
			</footer>
		</aside>
	);
}
