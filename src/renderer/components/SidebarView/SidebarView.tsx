import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { NewPlaylistButton } from './NewPlaylistButton/NewPlaylistButton';
import { PlaylistList } from './PlaylistList/PlaylistList';
import { Playlist } from '../../store/modules/playlist';
import './SidebarView.scss';

type SidebarViewProps = {
	recentPlaylists: Playlist[];
	currentPlaylistId: Playlist['_id'];
	onCreatePlaylist: Function;
};

export const SidebarView: FC<SidebarViewProps> = ({
	recentPlaylists = [],
	currentPlaylistId,
	onCreatePlaylist,
}) => {
	const { t } = useTranslation();

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
			</section>
		</aside>
	);
}
