import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import { useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { uniq } from 'lodash';
import cx from 'classnames';
import { Playlist, savePlaylistRequest } from '../../../../store/modules/playlist';
import { UIDragTypes } from '../../../../store/modules/ui';
import { PLAYLIST_SHOW } from '../../../../routes';

type SidebarPlaylistListItemProps = {
  playlist: Playlist;
  isCurrent: boolean;
  isPlaying: boolean;
  onContextMenu?: Function;
  onPlayButtonDoubleClick?: Function;
}

type DropItem = {
  type: string;
  _id: string;
}

export const SidebarPlaylistListItem: FC<SidebarPlaylistListItemProps> = ({
  playlist,
  isCurrent,
  isPlaying,
  onContextMenu,
  onPlayButtonDoubleClick
}) => {
  const dispatch = useDispatch();
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [
      UIDragTypes.SEARCH_RESULTS,
      UIDragTypes.LIBRARY_ALBUMS
    ],
    drop: (item: DropItem) => {
      dispatch(savePlaylistRequest({
        ...playlist,
        albums: uniq([...playlist.albums, item._id])
      }));
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  function onClick(): boolean {
    return isCurrent;
  }

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(playlist);
  }

  function _onPlayButtonDoubleClick(): void {
    onPlayButtonDoubleClick && onPlayButtonDoubleClick(playlist);
  }

  const classNames = cx('playlist', {
    'is-playing': isPlaying,
    'drag-is-over': isOver,
    'drag-can-drop': canDrop
  });

  return (
    <li ref={drop} className={classNames}>
      <Link
        onClick={onClick}
        onContextMenu={_onContextMenu}
        title={playlist._id}
        to={generatePath(PLAYLIST_SHOW, { _id: playlist._id })}
        className="sidebar-playlist-item">
          <FontAwesomeIcon
            icon={ isPlaying ? 'volume-up' : 'file-audio'}
            className="playlist-icon"
            fixedWidth/>
          {playlist.title}
      </Link>
      { isPlaying ? null :
        <button className="play-button" onDoubleClick={_onPlayButtonDoubleClick}>
          <FontAwesomeIcon
            icon="play-circle"
            className="play-button-icon"
            fixedWidth/>
        </button>
      }
    </li>
  );
}
