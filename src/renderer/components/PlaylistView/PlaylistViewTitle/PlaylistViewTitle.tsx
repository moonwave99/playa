import React, { FC, useState, useEffect, useRef, KeyboardEvent } from 'react';
import ContentEditable from 'react-contenteditable';
import { Playlist } from '../../../store/modules/playlist';

type PlaylistViewTitleProps = {
	playlist: Playlist;
  onTitleChange: Function;
};

export const PlaylistViewTitle: FC<PlaylistViewTitleProps> = ({ playlist, onTitleChange }) => {
	const { title } = playlist;
	const [isTitleEditing, setTitleEditing] = useState(false);
	const titleRef = useRef<HTMLInputElement>(null);

	function onTitleBlur(): void {
		setTitleEditing(false);
		onTitleChange(titleRef.current.innerText);
	}

	function onTitleFocus(): void {
		setTitleEditing(true);
	}

	useEffect(() => {
		if (!playlist._rev) {
			titleRef.current.focus();
		}
	}, [playlist._rev]);

	function onChange(): void { return; }

	function onKeyDown(event: KeyboardEvent): void {
		const { key } = event;
		switch (key) {
			case 'Enter':
				event.preventDefault();
				titleRef.current.blur();
				break;
			case 'Escape':
				event.preventDefault();
				titleRef.current.innerText = title;
				titleRef.current.blur();
				break;
		}
	}

	return (
		<>
			<span className="header-like">playlist://</span>
			<ContentEditable
				data-key-catch="Space"
				innerRef={titleRef}
				html={title}
				onFocus={onTitleFocus}
				onBlur={onTitleBlur}
				onKeyDown={onKeyDown}
				onChange={onChange}
				className={isTitleEditing ? 'editing' : null}
				tagName='h1'/>
			</>
	);
}
