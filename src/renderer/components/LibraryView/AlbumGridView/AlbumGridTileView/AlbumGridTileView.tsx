import React, { FC, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag } from 'react-dnd';
import { Link, generatePath } from 'react-router-dom';
import cx from 'classnames';
import { CoverView } from '../../../AlbumListView/AlbumView/CoverView/CoverView';
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
  isPlaying?: boolean;
  onContextMenu?: Function;
  onDoubleClick?: Function;
};

export const AlbumGridTileView: FC<AlbumGridTileViewProps> = ({
  album,
  isPlaying = false,
  onContextMenu,
  onDoubleClick
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { _id, artist: artistId } = album;
  const artist = useSelector((state: ApplicationState) => artistSelectors.findById(state, artistId));
  const cover = useSelector((state: ApplicationState) => coverSelectors.findById(state, _id));

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

  const [{ opacity }, drag] = useDrag({
    item: {
      type: UIDragTypes.LIBRARY_ALBUMS,
      _id,
      selection: [_id]
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    })
  });

  drag(drop(ref));

  useEffect(() => {
    dispatch(getCoverRequest(album));
  }, [album]);

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(album);
  }

  function _onDoubleClick(): void {
    onDoubleClick && onDoubleClick(album);
  }

  const { title } = album;

  const classNames = cx('album-grid-tile', {
    'is-playing': isPlaying,
    'drag-is-over': isOver,
    'drag-can-drop': canDrop
  });
	return (
    <article
      style={{ opacity }}
      className={classNames}>
      <div ref={ref} className="album-grid-tile-drag-wrapper">
        <CoverView
          className="album-cover"
          src={cover}
          album={album}
          onDoubleClick={_onDoubleClick}
          onContextMenu={_onContextMenu}/>
      </div>
      <Link
        className="album-artist"
        to={generatePath(ARTIST_SHOW, { _id: artistId })}>
        {formatArtist({ album, artist })}
      </Link>
      <span className="album-title">{title}</span>
    </article>
	);
}
