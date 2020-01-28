import React, { FC } from 'react';
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
  isCurrent: boolean;
  isPlaying: boolean;
  onContextMenu?: Function;
  onPlayButtonDoubleClick?: Function;
}

export const PlaylistListItem: FC<PlaylistListItemProps> = ({
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
      UIDragTypes.LIBRARY_ALBUMS,
      UIDragTypes.PLAYLIST_ALBUMS,
      UIDragTypes.QUEUE_ALBUMS
    ],
    drop: (item: UIDropItem) => {
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
    'is-new': !playlist._rev,
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
        className="playlist-item">
          <FontAwesomeIcon
            icon={ isPlaying ? 'volume-up' : 'file-audio'}
            className="playlist-icon"
            fixedWidth/>
          {playlist.title}
      </Link>
      { isPlaying || playlist.albums.length === 0 ? null :
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
