import React, { ReactElement, useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Playlist, savePlaylistRequest } from '../../../../store/modules/playlist';
import { ApplicationState } from '../../../../store/store';

export const PlaylistTitle = (): ReactElement => {
	const dispatch = useDispatch();
	const { _id } = useParams();
	const playlist = useSelector(({ playlists }: ApplicationState) => playlists.allById[_id] || {} as Playlist);
	const [title, setTitle] = useState(playlist.title);
	const [isTitleEditing, setTitleEditing] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	function onTitleChange(): void {
		if (title === playlist.title && playlist._rev) {
			return;
		}
		dispatch(savePlaylistRequest({ ...playlist, title: title.trim() }));
	}

	function onSubmit(): void {
		setTitleEditing(false);
		onTitleChange();
	}

	function onTitleClick(): void {
		setTitleEditing(true);
	}

	useEffect(() => {
		setTitleEditing(!playlist._rev);
	}, [playlist]);

	useEffect(() => {
		setTitle(playlist.title);
	}, [playlist.title]);

	function onChange(): void {
		setTitle(inputRef.current.value);
	}

	function onBlur(): void {
		setTitleEditing(false);
		onTitleChange();
	}

	function onKeyDown(event: KeyboardEvent): void {
		const { key } = event;
		switch (key) {
			case 'Escape':
				event.preventDefault();
				setTitleEditing(false);
				setTitle(playlist.title);
				break;
		}
	}

	function renderForm(): ReactElement {
		return (
			<form className="playlist-title-form" onSubmit={onSubmit}>
				<input
					className="header-like"
					ref={inputRef}
					defaultValue={title}
					type="text"
					onChange={onChange}
					onKeyDown={onKeyDown}
					onBlur={onBlur}
					required
					autoFocus
					data-key-catch="Space"/>
			</form>
		);
	}

	return (
		isTitleEditing
			? renderForm()
			: <h1 className="playlist-title" onClick={onTitleClick}>{title}</h1>
	);
}
