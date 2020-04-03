import React, { FC, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Ref } from 'react-popper-tooltip';
import cx from 'classnames';
import { CoverView } from '../../../CoverView/CoverView';
import {
  Album,
  getAlbumCoverRequest,
  getAlbumCoverFromUrlRequest
} from '../../../../store/modules/album';
import { selectors as artistSelectors } from '../../../../store/modules/artist';
import { ApplicationState } from '../../../../store/store';
import { UIDragTypes } from '../../../../store/modules/ui';
import useNativeDrop from '../../../../hooks/useNativeDrop/useNativeDrop';

import { ARTIST_SHOW } from '../../../../routes';
import { formatArtist } from '../../../../utils/albumUtils';

type AlbumGridTileViewProps = {
  album: Album;
  showArtist?: boolean;
  selected?: boolean;
  isPlaying?: boolean;
  isDragging?: boolean;
  style?: object;
  selectedIDs?: string[];
  onClick?: Function;
  onDoubleClick?: Function;
  onContextMenu?: Function;
  onDragBegin?: Function;
  onDragEnd?: Function;
  onMouseEnter?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  tooltipTriggerRef?: Ref;
};

export const AlbumGridTileView: FC<AlbumGridTileViewProps> = ({
  album,
  showArtist = true,
  isPlaying = false,
  isDragging = false,
  selected = false,
  style,
  selectedIDs = [],
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragBegin,
  onDragEnd,
  onMouseEnter,
  onMouseLeave,
  tooltipTriggerRef
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { _id, artist: artistId, cover } = album;
  const artist = useSelector((state: ApplicationState) => artistSelectors.findById(state, artistId));
  const selection = selectedIDs.indexOf(_id) > -1 ? selectedIDs : [_id];

  function onDrop(url: string): void {
    dispatch(getAlbumCoverFromUrlRequest(album, url));
  }

  const {
    canDrop,
    isOver,
    drop
  } = useNativeDrop({
    onDrop,
    filter: (type: string) => type.startsWith('image')
  });

  const [, drag, preview] = useDrag({
    item: {
      type: UIDragTypes.LIBRARY_ALBUMS,
      _id,
      selection
    },
    begin: () => onDragBegin && onDragBegin(),
    end: () => onDragEnd && onDragEnd()
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])

  drag(drop(ref));

  useEffect(() => {
    if (!cover) {
      dispatch(getAlbumCoverRequest(album));
    }
  }, [cover]);


  function _onClick(event: React.MouseEvent): void {
    onClick && onClick(event, album, artist);
  }

  function _onDoubleClick(): void {
    onDoubleClick && onDoubleClick(album, artist);
  }

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(album, artist);
  }

  const { title, year } = album;

  const classNames = cx('album-grid-tile', {
    'is-playing': isPlaying,
    'selected': selected,
    'drag-is-over': isOver,
    'drag-can-drop': canDrop,
    'is-dragging': isDragging && selected
  });
	return (
    <article
      style={style}
      className={classNames}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      id={`album-grid-tile-${_id}`}
      ref={tooltipTriggerRef}>
      <div ref={ref} className="album-grid-tile-drag-wrapper">
        <CoverView
          className="album-cover"
          src={cover}
          album={album}
          onClick={_onClick}
          onDoubleClick={_onDoubleClick}
          onContextMenu={_onContextMenu}/>
      </div>
      {showArtist &&
        <Link
          className="album-artist"
          to={generatePath(ARTIST_SHOW, { _id: artistId })}>
          {formatArtist({ album, artist })}
        </Link>
      }
      <span className="album-title">{title}</span>
      <span className="album-year">{year}</span>
    </article>
	);
}
