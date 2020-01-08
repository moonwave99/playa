import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import { useDrop } from 'react-dnd';
import { uniq } from 'lodash';
import cx from 'classnames';
import { Playlist, savePlaylist } from '../../../../store/modules/playlist';
import { AlbumDragType } from '../../../../store/modules/ui';
import { PLAYLIST_SHOW } from '../../../../routes';

type PlaylistListItemProps = {
  playlist: Playlist;
  isCurrent: boolean;
}

type DropItem = {
  type: string;
  _id: string;
}

export const PlaylistListItem: FC<PlaylistListItemProps> = ({
  playlist,
  isCurrent
}) => {
  const dispatch = useDispatch();
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [AlbumDragType],
    drop: (item: DropItem) => {
      dispatch(savePlaylist({
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

  const classNames = cx('playlist', {
    'current': isCurrent,
    'drag-is-over': isOver,
    'drag-can-drop': canDrop
  });

  return (
    <li ref={drop} className={classNames}>
      <Link
        onClick={onClick}
        title={playlist._id}
        to={generatePath(PLAYLIST_SHOW, { _id: playlist._id })}
        className="playlist-item">{playlist.title}</Link>
    </li>
  );
}
