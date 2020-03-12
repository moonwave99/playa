import React, { ReactElement, FC } from 'react';
import { useLocation, matchPath } from 'react-router';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { NewPlaylistButton } from './NewPlaylistButton/NewPlaylistButton';
import { PlaylistList } from './PlaylistList/PlaylistList';
import { Playlist } from '../../store/modules/playlist';
import './SidebarView.scss';
import { PLAYLIST_ALL } from '../../routes';

type SidebarViewProps = {
	recentPlaylists: Playlist[];
	currentPlaylistId: Playlist['_id'];
	onCreatePlaylist: Function;
};

const icons: { [key: string]: IconName } = {
	[PLAYLIST_ALL]: 'list'
};

const i18nkeys: { [key: string]: string } = {
	[PLAYLIST_ALL]: 'sidebar.buttons.playlist.all'
};

export const SidebarView: FC<SidebarViewProps> = ({
	recentPlaylists = [],
	currentPlaylistId,
	onCreatePlaylist,
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

	return (
		<aside className="sidebar">
			<section className="sidebar-playlists">
				<h2 className="sidebar-title">{t('sidebar.buttons.playlist.recent')}</h2>
				<NewPlaylistButton
					onClick={onCreatePlaylist}
					onDrop={onCreatePlaylist}/>
				<PlaylistList
					playlists={recentPlaylists}
					currentPlaylistId={currentPlaylistId}/>
				<div className="button-wrapper">
					{renderLink(PLAYLIST_ALL, 'all-playlists')}
				</div>
			</section>
		</aside>
	);
}
