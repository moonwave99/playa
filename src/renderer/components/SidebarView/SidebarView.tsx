import React, { ReactElement, FC } from 'react';
import { useLocation, matchPath } from 'react-router';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { SearchBar } from '../SearchBar/SearchBar';
import { QueueButton } from './QueueButton/QueueButton';
import { NewPlaylistButton } from './NewPlaylistButton/NewPlaylistButton';
import { PlaylistList } from './PlaylistList/PlaylistList';
import { Playlist } from '../../store/modules/playlist';
import './SidebarView.scss';
import {
	SEARCH,
	PLAYLIST_ALL,
	LIBRARY
} from '../../routes';

type SidebarViewProps = {
	hasSearchFocus: boolean;
	recentPlaylists: Playlist[];
	currentPlaylistId: Playlist['_id'];
	onCreatePlaylist: Function;
	onSearchBarBlur: Function;
	onSearchFormSubmit: Function;
	onQueueButtonDrop: Function;
};

const icons: { [key: string]: IconName } = {
	[SEARCH]: 'search',
	[PLAYLIST_ALL]: 'list',
	[LIBRARY]: 'music'
};

const i18nkeys: { [key: string]: string } = {
	[SEARCH]: 'sidebar.buttons.search',
	[PLAYLIST_ALL]: 'sidebar.buttons.playlist.all',
	[LIBRARY]: 'sidebar.buttons.library'
};

export const SidebarView: FC<SidebarViewProps> = ({
	hasSearchFocus,
	recentPlaylists = [],
	currentPlaylistId,
	onCreatePlaylist,
	onSearchBarBlur,
	onSearchFormSubmit,
	onQueueButtonDrop,
}) => {
	const { t } = useTranslation();
	const location = useLocation();

	function renderLink(path: string, className: string): ReactElement {
		const classNames = cx('button', `button-${className}`, {
			'button-outline': !matchPath(location.pathname, { path })
		});
		return (
			<Link to={path} className={classNames}>
				<FontAwesomeIcon icon={icons[path]} className="button-icon"/>
				<span className="button-text">{t(i18nkeys[path])}</span>
			</Link>
		);
	}

	function renderSearchBar(): ReactElement {
		return (
			<div className="searchbar-wrapper">
        <SearchBar
					hasFocus={hasSearchFocus}
					onFormSubmit={onSearchFormSubmit}
					onBlur={onSearchBarBlur}/>
      </div>
		);
	}

	return (
		<aside className="sidebar">
			<section className="sidebar-header">
				<div className="button-wrapper">
					{renderSearchBar()}
					{renderLink(LIBRARY, 'library')}
					<QueueButton onDrop={onQueueButtonDrop}/>
				</div>
			</section>
			<section className="sidebar-footer">
				<h2 className="sidebar-title">{t('sidebar.buttons.playlist.recent')}</h2>
				<NewPlaylistButton
					onClick={onCreatePlaylist}
					onDrop={onCreatePlaylist}/>
				<PlaylistList playlists={recentPlaylists} currentPlaylistId={currentPlaylistId}/>
				<div className="button-wrapper">
					{renderLink(PLAYLIST_ALL, 'all-playlists')}
				</div>
			</section>
		</aside>
	);
}
