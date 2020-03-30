import React, { FC, useEffect, useRef, MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Link, generatePath } from 'react-router-dom';
import cx from 'classnames';
import { CoverView } from '../../../CoverView/CoverView';
import { Album } from '../../../../store/modules/album';
import { selectors as artistSelectors } from '../../../../store/modules/artist';
import {
  getCoverRequest,
  getCoverFromUrlRequest,
  selectors as coverSelectors
} from '../../../../store/modules/cover';
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
  onDragEnd
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { _id, artist: artistId } = album;
  const cover = useSelector((state: ApplicationState) => coverSelectors.findById(state, _id));
  const artist = useSelector((state: ApplicationState) => artistSelectors.findById(state, artistId));
  const selection = selectedIDs.indexOf(_id) > -1 ? selectedIDs : [_id];

  function onDrop(url: string): void {
    dispatch(getCoverFromUrlRequest(album, url));
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
    dispatch(getCoverRequest(album));
  }, [album]);


  function _onClick(event: MouseEvent): void {
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
      id={`album-grid-tile-${_id}`}>
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
