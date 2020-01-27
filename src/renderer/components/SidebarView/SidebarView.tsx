import React, { ReactElement, FC } from 'react';
import { useLocation, matchPath } from 'react-router';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconName } from '@fortawesome/fontawesome-svg-core';
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

const icons: { [key: string]: IconName } = {
	[QUEUE]: 'play',
	[SEARCH]: 'search',
	[PLAYLIST_ALL]: 'list',
	[LIBRARY]: 'music'
};

const i18nkeys: { [key: string]: string } = {
	[QUEUE]: 'sidebar.buttons.queue',
	[SEARCH]: 'sidebar.buttons.search',
	[PLAYLIST_ALL]: 'sidebar.buttons.playlist.all',
	[LIBRARY]: 'sidebar.buttons.library'
};

export const SidebarView: FC<SidebarViewProps> = ({
	recentPlaylists = [],
	currentPlaylistId,
	onCreatePlaylistButtonClick
}) => {
	const { t } = useTranslation();
	const location = useLocation();

	function _onCreatePlaylistButtonClick(): void {
		onCreatePlaylistButtonClick();
	}

	function renderLink(path: string): ReactElement {
		const classNames = matchPath(location.pathname, { path }) ? 'button' : 'button button-outline';
		return (
			<Link to={path} className={classNames}>
				<FontAwesomeIcon icon={icons[path]} className="button-icon"/>
				<span className="button-text">{t(i18nkeys[path])}</span>
			</Link>
		);
	}

	return (
		<aside className="sidebar">
			<section className="sidebar-header">
				<div className="button-wrapper">
					{renderLink(LIBRARY)}
					{renderLink(QUEUE)}
				</div>
			</section>
			<section className="sidebar-footer">
				<SidebarPlaylistList playlists={recentPlaylists} currentPlaylistId={currentPlaylistId}/>
				<div className="button-wrapper">
					<button type="button" className="button" onClick={_onCreatePlaylistButtonClick}>
						<FontAwesomeIcon icon="plus" className="button-icon"/>
						<span className="button-text">{t('sidebar.buttons.playlist.new')}</span>
					</button>
					{renderLink(PLAYLIST_ALL)}
				</div>
			</section>
		</aside>
	);
}
