import React, { FC, SyntheticEvent, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { XYCoord } from 'dnd-core';
import { CoverView } from '../AlbumView/CoverView/CoverView';
import { ApplicationState } from '../../../store/store';
import { play } from '../../../store/modules/player';
import { Playlist } from '../../../store/modules/playlist';
import { Album, VARIOUS_ARTISTS_ID } from '../../../store/modules/album';
import { UIDragTypes } from '../../../store/modules/ui';
import { getCoverRequest } from '../../../store/modules/cover';
import './CompactAlbumView.scss';

interface DragItem {
  index: number;
  _id: string;
  type: string;
}

type CompactAlbumViewProps = {
  playlistId?: Playlist['_id'];
  album: Album;
  index: number;
  isCurrent: boolean;
  onDragEnd: Function;
  onAlbumMove: Function;
}

export const CompactAlbumView: FC<CompactAlbumViewProps> = ({
  playlistId,
  album,
  index,
  isCurrent = false,
  onDragEnd,
  onAlbumMove
}) => {
  const { _id, type, year, artist, title } = album;

  const cover = useSelector((state: ApplicationState) => {
    return state.covers.allById[_id];
  });

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCoverRequest(album));
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: UIDragTypes.COMPACT_ALBUMS,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      const draggingDownwards = dragIndex < hoverIndex && hoverClientY < hoverMiddleY;
      const draggingUpwards = dragIndex > hoverIndex && hoverClientY > hoverMiddleY;
      if (draggingDownwards || draggingUpwards) {
        return;
      }
      onAlbumMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  })

  const [{ isDragging }, drag] = useDrag({
    item: { type: UIDragTypes.COMPACT_ALBUMS, _id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_item, monitor) => {
      if (monitor.didDrop()) {
        onDragEnd();
      }
    }
  });
  drag(drop(ref));

  function onDoubleClick(event: SyntheticEvent): void {
    event.preventDefault();
    dispatch(play({
      playlistId,
      albumId: album._id,
      trackId: album.tracks[0]
    }));
  }

  const classNames = cx('compact-album-view', {
    'is-current': isCurrent,
    'drag-is-over': isOver,
    'drag-can-drop': canDrop,
    'drag-is-dragging': isDragging
  });
  const tagClasses = cx('album-type', `album-type-${type}`);
  return (
    <article className={classNames} ref={ref} onDoubleClick={onDoubleClick}>
      <CoverView
        className="album-cover"
        src={cover}
        title={`[${_id}] ${artist} - ${title}`}/>
      <p className="album-content">
        <span className="title">{title}</span>
        <span className="info">
          {artist === VARIOUS_ARTISTS_ID ? 'V/A' : artist}{year ? `, ${year}` : null} - <span className={tagClasses}>{type}</span>
        </span>
      </p>
    </article>
  );
}
