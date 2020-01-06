import React, { FC, ReactElement, useRef, SyntheticEvent } from 'react';
import { Playlist } from '../../../store/modules/playlists';

type PlaylistViewTitleProps = {
	playlist: Playlist;
  onTitleClick: Function;
  onFormSubmit: Function;
  isTitleEditing: boolean;
};

export const PlaylistViewTitle: FC<PlaylistViewTitleProps> = ({ playlist, onTitleClick, onFormSubmit, isTitleEditing }) => {
	const inputRef = useRef<HTMLInputElement>(null);

	function _onTitleClick(event: SyntheticEvent): void {
    event.stopPropagation();
    onTitleClick();
	}

  function _onFormClick(event: SyntheticEvent): void {
    event.stopPropagation();
  }

	function _onFormSubmit(event: SyntheticEvent): void {
		event.preventDefault();
    onFormSubmit(inputRef.current.value);
	}

	function renderTitle(): ReactElement {
		return (
			<h2 onClick={_onTitleClick}>{playlist.title}</h2>
		);
	}

	function renderForm(): ReactElement {
		return (
			<form onSubmit={_onFormSubmit} className="playlist-header-form" onClick={_onFormClick}>
				<input
          name="title"
          type="text"
          defaultValue={playlist.title}
          ref={inputRef}
          required
          autoFocus
          className="playlist-header-form-input"/>
			</form>
		);
	}

	return (
		isTitleEditing ? renderForm() : renderTitle()
	);
}
