import React, { ReactElement, FC, useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Playlist } from '../../../store/modules/playlist';

type PlaylistViewTitleProps = {
	playlist: Playlist;
  onTitleChange: Function;
};

export const PlaylistViewTitle: FC<PlaylistViewTitleProps> = ({ playlist, onTitleChange }) => {
	const [title, setTitle] = useState(playlist.title);
	const [isTitleEditing, setTitleEditing] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	function onSubmit(): void {
		setTitleEditing(false);
		onTitleChange(title);
	}

	function onTitleClick(): void {
		setTitleEditing(true);
	}

	useEffect(() => {
		if (!playlist._rev) {
			setTitleEditing(true);
		}
	}, [playlist._rev]);

	useEffect(() => {
		setTitle(playlist.title);
	}, [playlist.title]);

	function onChange(): void {
		setTitle(inputRef.current.value);
	}

	function onBlur(): void {
		setTitleEditing(false);
	}

	function onKeyDown(event: KeyboardEvent): void {
		const { key } = event;
		switch (key) {
			case 'Escape':
				event.preventDefault();
				setTitleEditing(false);
				break;
		}
	}

	function renderForm(): ReactElement {
		return (
			<form onSubmit={onSubmit}>
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
			: <h1 onClick={onTitleClick}>{title}</h1>
	);
}
