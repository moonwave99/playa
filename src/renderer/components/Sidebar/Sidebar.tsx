import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { PlaylistList } from './PlaylistList/PlaylistList';
import { Playlist } from '../../store/modules/playlist';
import './Sidebar.scss';
import { SEARCH } from '../../routes';

type SidebarProps = {
	playlists: Playlist[];
	onCreatePlaylistButtonClick: Function;
};

export const Sidebar: FC<SidebarProps> = ({
	playlists = [],
	onCreatePlaylistButtonClick
}) => {
	function onButtonClick(): void {
		onCreatePlaylistButtonClick();
	}

	return (
		<section className="sidebar">
			<header className="sidebar-header">
				<Link to={SEARCH} className="button button-primary">Search</Link>
			</header>
			<PlaylistList playlists={playlists} />
			<footer className="sidebar-footer">
				<button type="button" className="button button-primary" onClick={onButtonClick}>
					Create Playlist
        </button>
			</footer>
		</section>
	);
}
