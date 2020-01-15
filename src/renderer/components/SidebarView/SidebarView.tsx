import React, { FC } from 'react';
import { Link } from 'react-router-dom';
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
					Create Playlist
        </button>
				<Link to={PLAYLIST_ALL} className="button button-outline">All Playlists</Link>
			</footer>
		</aside>
	);
}
