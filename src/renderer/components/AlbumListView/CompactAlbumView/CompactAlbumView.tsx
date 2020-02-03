import React, { FC, SyntheticEvent, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { XYCoord } from 'dnd-core';
import { AlbumActionsView, ActionsConfig } from '../AlbumActionsView/AlbumActionsView';
import { CoverView } from '../AlbumView/CoverView/CoverView';
import { Album } from '../../../store/modules/album';
import { UIDragTypes } from '../../../store/modules/ui';
import { getCoverRequest, selectors as coverSelectors } from '../../../store/modules/cover';
import { ApplicationState } from '../../../store/store';
import { formatArtist } from '../../../utils/albumUtils';
import './CompactAlbumView.scss';

interface DragItem {
  index: number;
  _id: string;
  type: string;
}

type CompactAlbumViewProps = {
  album: Album;
  index: number;
  isCurrent?: boolean;
  albumActions?: ActionsConfig[];
  onDragEnd?: Function;
  onAlbumMove: Function;
  onContextMenu: Function;
  onDoubleClick: Function;
  sortable?: boolean;
}

export const CompactAlbumView: FC<CompactAlbumViewProps> = ({
  album,
  index,
  isCurrent = false,
  albumActions,
  onDragEnd,
  onAlbumMove,
  onContextMenu,
  onDoubleClick,
  sortable = false
}) => {
  const { _id, type, year, title } = album;
  const cover = useSelector((state: ApplicationState) => coverSelectors.findById(state, _id));

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCoverRequest(album));
  }, [album]);

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
    }
  });

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
  if (sortable) {
    drag(drop(ref));
  }

  function _onDoubleClick(event: SyntheticEvent): void {
    event.preventDefault();
    onDoubleClick(album);
  }

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(album);
  }

  const classNames = cx('compact-album-view', {
    'sortable': sortable,
    'is-current': isCurrent,
    'drag-is-over': isOver,
    'drag-can-drop': canDrop,
    'drag-is-dragging': isDragging
  });
  const tagClasses = cx('album-type', `album-type-${type}`);
  return (
    <article
      className={classNames}
      ref={ref}
      onDoubleClick={_onDoubleClick}
      onContextMenu={_onContextMenu}>
      <div className="album-inner-wrapper">
        <CoverView
          className="album-cover"
          src={cover}
          album={album}/>
        <p className="album-content header-like">
          <span className="title">
            {title}{ isCurrent ? <FontAwesomeIcon className="icon" icon="volume-up"/> : null }
          </span>
          <span className="info">
            {formatArtist(album)}{year ? `, ${year}` : null} - <span className={tagClasses}>{type}</span>
          </span>
        </p>
        { albumActions.length > 0 && <AlbumActionsView album={album} actions={albumActions}/>}
      </div>
    </article>
  );
}
