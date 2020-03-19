import React, { FC, SyntheticEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { CoverView } from '../AlbumView/CoverView/CoverView';
import useReorder from '../../../hooks/useReorder/useReorder';
import { Album, getAlbumContentById } from '../../../store/modules/album';
import { UIDragTypes } from '../../../store/modules/ui';
import { getCoverRequest } from '../../../store/modules/cover';
import { ApplicationState } from '../../../store/store';
import { formatArtist } from '../../../utils/albumUtils';
import './CompactAlbumView.scss';

type CompactAlbumViewProps = {
  album: Album;
  index: number;
  isCurrent?: boolean;
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
  onDragEnd,
  onAlbumMove,
  onContextMenu,
  onDoubleClick,
  sortable = false
}) => {
  const { _id, type, year, title } = album;
  const { cover, artist } = useSelector((state: ApplicationState) => getAlbumContentById(state, _id));

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCoverRequest(album));
  }, [album]);

  const {
    isOver,
    canDrop,
    isDragging,
    ref
  } = useReorder({
    _id,
    index,
    sortable,
    accept: UIDragTypes.COMPACT_ALBUMS,
    type: UIDragTypes.COMPACT_ALBUMS,
    onMove: onAlbumMove,
    onDragEnd
  });

  function _onDoubleClick(event: SyntheticEvent): void {
    event.preventDefault();
    onDoubleClick(album, artist);
  }

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(album, artist);
  }

  function onActionsButtonClick(): void {
    _onContextMenu();
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
            {formatArtist({ album, artist })}{year ? `, ${year}` : null} - <span className={tagClasses}>{type}</span>
          </span>
        </p>
        <button onClick={onActionsButtonClick} className="button-album-actions">
          <FontAwesomeIcon className="icon" icon="ellipsis-h"/>
        </button>
      </div>
    </article>
  );
}
