import React, { ReactElement, SyntheticEvent, FC } from 'react';
import { useDispatch } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import { useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { uniq } from 'lodash';
import cx from 'classnames';
import { Playlist, savePlaylistRequest } from '../../../../store/modules/playlist';
import { UIDragTypes, UIDropItem } from '../../../../store/modules/ui';
import { PLAYLIST_SHOW } from '../../../../routes';

type PlaylistListItemProps = {
  playlist: Playlist;
  isCurrent?: boolean;
  isPlaying?: boolean;
  onContextMenu?: Function;
  onPlayButtonDoubleClick?: Function;
}

export const PlaylistListItem: FC<PlaylistListItemProps> = ({
  playlist,
  isCurrent = false,
  isPlaying = false,
  onContextMenu,
  onPlayButtonDoubleClick
}) => {
  const { _id, _rev, title, albums } = playlist;
  const dispatch = useDispatch();
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [
      UIDragTypes.SEARCH_RESULTS,
      UIDragTypes.LIBRARY_ALBUMS,
      UIDragTypes.PLAYLIST_ALBUMS,
      UIDragTypes.QUEUE_ALBUMS
    ],
    drop: ({ _id }: UIDropItem) => {
      dispatch(savePlaylistRequest({
        ...playlist,
        albums: uniq([...albums, _id])
      }));
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  function onClick(event: SyntheticEvent): void {
    if (isCurrent) {
      event.preventDefault();
    }
  }

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(playlist);
  }

  function _onPlayButtonDoubleClick(): void {
    onPlayButtonDoubleClick && onPlayButtonDoubleClick(playlist);
  }

  function renderPlayButton(): ReactElement {
    if (isPlaying || albums.length === 0) {
      return null;
    }
    return (
      <button className="play-button" onDoubleClick={_onPlayButtonDoubleClick}>
        <FontAwesomeIcon
          icon="play-circle"
          className="play-button-icon"
          fixedWidth/>
      </button>
    );
  }  

  const classNames = cx('playlist-list-item', {
    'is-new': !_rev,
    'is-playing': isPlaying,
    'drag-is-over': isOver,
    'drag-can-drop': canDrop
  });

  return (
    <li ref={drop} className={classNames} onContextMenu={_onContextMenu}>
      <Link
        onClick={onClick}
        title={_id}
        to={generatePath(PLAYLIST_SHOW, { _id })}
        className="playlist-list-item-link">
          <FontAwesomeIcon
            icon={ isPlaying ? 'volume-up' : 'file-audio'}
            className="playlist-icon"
            fixedWidth/>
          {title}
      </Link>
      { renderPlayButton() }
    </li>
  );
}
