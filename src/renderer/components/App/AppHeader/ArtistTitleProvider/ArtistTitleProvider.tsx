import React, { ReactElement, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Artist, saveArtistRequest } from '../../../../store/modules/artist';
import { setEditArtistTitle } from '../../../../store/modules/ui';
import { ApplicationState } from '../../../../store/store';

import { EditableTitle } from '../EditableTitle/EditableTitle';

export const ArtistTitleProvider = (): ReactElement => {
	const dispatch = useDispatch();
	const { _id } = useParams();
	const { artist, isTitleEditing } = useSelector(({ artists, ui }: ApplicationState) => {
		return {
			artist: artists.allById[_id] || {} as Artist,
			isTitleEditing: ui.editArtistTitle
		}
	});
	const [isEditing, setEditing] = useState(false);

	function onTitleChange(title?: string): void {
		if (!title || title === artist.name) {
			return;
		}
		dispatch(saveArtistRequest({ ...artist, name: title.trim() }));
	}

	function onBlur(): void {
		dispatch(setEditArtistTitle(false));
	}

	function onSubmit(title: string): void {
		dispatch(setEditArtistTitle(false));
		onTitleChange(title);
	}

	function onTitleClick(): void {
		dispatch(setEditArtistTitle(true));
	}

	useEffect(() => {
		setEditing(isTitleEditing);
	}, [isTitleEditing]);

	return (
		<EditableTitle
			className="artist-title"
			isEditing={isEditing}
			title={artist.name}
			subTitle="Artist"
			onTitleClick={onTitleClick}
			onBlur={onBlur}
			onSubmit={onSubmit}/>
	);
}
