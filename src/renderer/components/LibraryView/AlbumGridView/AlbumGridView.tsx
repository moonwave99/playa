import React, { FC, ReactElement, MouseEvent, useState, useEffect } from 'react';
import { AlbumGridTileView } from './AlbumGridTileView/AlbumGridTileView';
import { Album } from '../../../store/modules/album';
import useGrid from '../../../hooks/useGrid/useGrid';

import './AlbumGridView.scss';

import { ALBUM_GRID_THRESHOLDS } from '../../../../constants';

type AlbumGridViewProps = {
  albums: Album[];
  currentAlbumId?: Album['_id'];
  showArtists?: boolean;
  clearSelectionOnBlur?: boolean;
  onSelectionChange?: Function;
  onEnter?: Function;
  onBackspace?: Function;
  onAlbumContextMenu?: Function;
  onAlbumDoubleClick?: Function;
};

export const AlbumGridView: FC<AlbumGridViewProps> = ({
  albums = [],
  currentAlbumId,
  clearSelectionOnBlur = false,
  showArtists = true,
  onSelectionChange,
  onEnter,
  onBackspace,
  onAlbumContextMenu,
  onAlbumDoubleClick
}) => {
  const [isDragging, setDragging] = useState(false);

  const {
    grid,
    rows,
    selection,
    threshold,
    onItemClick
  } = useGrid({
    items: albums,
    thresholds: ALBUM_GRID_THRESHOLDS,
    excludeClass: '.album-cover',
    clearSelectionOnBlur,
    onEnter,
    onBackspace
  });

  useEffect(() => {
    onSelectionChange && onSelectionChange(selection);
  }, [selection]);

  function onDragBegin(): void {
    setDragging(true);
  }

  function onDragEnd(): void {
    setDragging(false);
  }

  function renderTile(album: Album): ReactElement {
    if (!album) {
      return;
    }
    function onClick(event: MouseEvent, { _id }: Album): void {
      onItemClick({
        _id,
        ...event
      });
    }
    const { _id } = album;
    return (
      <AlbumGridTileView
        style={{ width: `${(100 / threshold.columns)}%` }}
        showArtist={showArtists}
        key={_id}
        album={album}
        selected={selection.indexOf(_id) > -1}
        selectedIDs={selection}
        isPlaying={_id === currentAlbumId}
        isDragging={isDragging}
        onClick={onClick}
        onDoubleClick={onAlbumDoubleClick}
        onContextMenu={onAlbumContextMenu}
        onDragBegin={onDragBegin}
        onDragEnd={onDragEnd}/>
    );
  }

	return (
    <div className="album-grid" data-key-catch="useGrid" ref={grid}>
      {
        rows.map((row, index) =>
          <div
            className="album-grid-row"
            key={index}>{row.map(renderTile)}
          </div>
        )
      }
    </div>
	);
}
