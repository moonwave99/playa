import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { SidebarPlaylistList } from './SidebarPlaylistList/SidebarPlaylistList';
import { Playlist } from '../../store/modules/playlist';
import './SidebarView.scss';
import { SEARCH, PLAYLIST_ALL } from '../../routes';

type SidebarViewProps = {
	playlists: Playlist[];
	onCreatePlaylistButtonClick: Function;
};

export const SidebarView: FC<SidebarViewProps> = ({
	playlists = [],
	onCreatePlaylistButtonClick
}) => {
	function _onCreatePlaylistButtonClick(): void {
		onCreatePlaylistButtonClick();
	}

	return (
		<section className="sidebar">
			<header className="sidebar-header">
				<Link to={SEARCH} className="button button-primary">Search</Link>
			</header>
			<SidebarPlaylistList playlists={playlists} />
			<footer className="sidebar-footer">
				<button type="button" className="button button-primary" onClick={_onCreatePlaylistButtonClick}>
					Create Playlist
        </button>
				<Link to={PLAYLIST_ALL} className="button button-outline">All Playlists</Link>
			</footer>
		</section>
	);
}
