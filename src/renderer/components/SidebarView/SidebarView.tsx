import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SidebarPlaylistList } from './SidebarPlaylistList/SidebarPlaylistList';
import { Playlist } from '../../store/modules/playlist';
import './SidebarView.scss';
import {
	QUEUE,
	SEARCH,
	PLAYLIST_ALL,
	LIBRARY
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
	const { t } = useTranslation();

	function _onCreatePlaylistButtonClick(): void {
		onCreatePlaylistButtonClick();
	}

	return (
		<aside className="sidebar">
			<section className="sidebar-header">
				<div className="button-wrapper">
					<Link to={SEARCH} className="button">
						<FontAwesomeIcon icon="search" className="button-icon"/>
						<span className="button-text">{t('sidebar.buttons.search')}</span>
					</Link>
					<Link to={LIBRARY} className="button button-outline">
						<FontAwesomeIcon icon="music" className="button-icon"/>
						<span className="button-text">{t('sidebar.buttons.library')}</span>
					</Link>
				</div>
			</section>
			<section className="sidebar-footer">
				<SidebarPlaylistList playlists={recentPlaylists} currentPlaylistId={currentPlaylistId}/>
				<div className="button-wrapper">
					<button type="button" className="button" onClick={_onCreatePlaylistButtonClick}>
						<FontAwesomeIcon icon="plus" className="button-icon"/>
						<span className="button-text">{t('sidebar.buttons.playlist.new')}</span>
					</button>
					<Link to={PLAYLIST_ALL} className="button button-outline">
						<FontAwesomeIcon icon="list" className="button-icon"/>
						<span className="button-text">{t('sidebar.buttons.playlist.all')}</span>
					</Link>
					<Link to={QUEUE} className="button button-outline">
						<FontAwesomeIcon icon="play" className="button-icon"/>
						<span className="button-text">{t('sidebar.buttons.queue')}</span>
					</Link>
				</div>
			</section>
		</aside>
	);
}
