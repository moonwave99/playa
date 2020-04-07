import React, { FC } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { Ref } from 'react-popper-tooltip';
import cx from 'classnames';
import { Playlist } from '../../../store/modules/playlist';
import { PLAYLIST_SHOW } from '../../../routes';

type PlaylistGridTileViewProps = {
  playlist: Playlist;
  selected?: boolean;
  isPlaying?: boolean;
  style?: object;
  onClick?: Function;
  onContextMenu?: Function;
  onMouseEnter?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  tooltipTriggerRef?: Ref;
};

export const PlaylistGridTileView: FC<PlaylistGridTileViewProps> = ({
  playlist,
  isPlaying = false,
  selected = false,
  style,
  onClick,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
  tooltipTriggerRef
}) => {
  const { _id, title } = playlist;

  function _onClick(event: React.MouseEvent): void {
    onClick && onClick(event, playlist);
  }

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(playlist);
  }

  const classNames = cx('playlist-grid-tile', {
    'is-playing': isPlaying,
    'selected': selected
  });
	return (
    <article
      style={style}
      className={classNames}
      onContextMenu={_onContextMenu}
      onClick={_onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      id={`playlist-grid-tile-${_id}`}
      ref={tooltipTriggerRef}>
      <figure className="playlist-cover">
        <img className="loaded"/>
      </figure>
      <Link
        to={generatePath(PLAYLIST_SHOW, { _id })}
        className="playlist-title">{title}</Link>
    </article>
	);
}
