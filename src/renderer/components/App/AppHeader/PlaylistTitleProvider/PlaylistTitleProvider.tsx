import React, { ReactElement, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Playlist, savePlaylistRequest } from '../../../../store/modules/playlist';
import { setEditPlaylistTitle } from '../../../../store/modules/ui';
import { ApplicationState } from '../../../../store/store';
import { formatDate } from '../../../../utils/datetimeUtils';

import { EditableTitle } from '../EditableTitle/EditableTitle';

export const PlaylistTitleProvider = (): ReactElement => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const { _id } = useParams();
	const { playlist, isTitleEditing } = useSelector(({ playlists, ui }: ApplicationState) => {
		return {
			playlist: playlists.allById[_id] || {} as Playlist,
			isTitleEditing: ui.editPlaylistTitle
		}
	});
	const [isEditing, setEditing] = useState(false);

	useEffect(() => {
		setEditing(isTitleEditing);
	}, [isTitleEditing]);

	useEffect(() => {
		if (!playlist._id) {
			return;
		}
		dispatch(setEditPlaylistTitle(!playlist._rev));
	}, [playlist]);

	function onTitleChange(title?: string): void {
		if (title === playlist.title && playlist._rev) {
			return;
		}
		if (title) {
			dispatch(savePlaylistRequest({ ...playlist, title: title.trim() }));
		}
	}

	function onBlur(): void {
		dispatch(setEditPlaylistTitle(false));
	}

	function onSubmit(title: string): void {
		dispatch(setEditPlaylistTitle(false));
		onTitleChange(title);
	}

	function onTitleClick(): void {
		dispatch(setEditPlaylistTitle(true));
	}

	const date = formatDate({
		date: playlist.created,
		options: { year: 'numeric', month: 'long', day: 'numeric' }
	});

	return (
		<EditableTitle
			className="playlist-title"
			isEditing={isEditing}
			title={playlist.title}
			subTitle={t('playlists.createdOn', { date })}
			onTitleClick={onTitleClick}
			onBlur={onBlur}
			onSubmit={onSubmit}/>
	);
}
