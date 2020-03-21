import React, { FC, ReactElement, MouseEvent } from 'react';
import { AlbumGridTileView } from './AlbumGridTileView/AlbumGridTileView';
import { Album } from '../../../store/modules/album';
import useGrid from '../../../hooks/useGrid/useGrid';

import './AlbumGridView.scss';

import { ALBUM_GRID_THRESHOLDS } from '../../../../constants';

type AlbumGridViewProps = {
  albums: Album[];
  currentAlbumId?: Album['_id'];
  showArtists?: boolean;
  onEnter?: Function;
  onBackspace?: Function;
  onAlbumContextMenu?: Function;
  onAlbumDoubleClick?: Function;
};

export const AlbumGridView: FC<AlbumGridViewProps> = ({
  albums = [],
  currentAlbumId,
  showArtists = true,
  onEnter,
  onBackspace,
  onAlbumContextMenu,
  onAlbumDoubleClick
}) => {
  const {
    grid,
    rows,
    selection,
    threshold,
    onItemClick
  } = useGrid({
    items: albums,
    thresholds: ALBUM_GRID_THRESHOLDS,
    onEnter,
    onBackspace
  });

  function renderTile(album: Album): ReactElement {
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
        isPlaying={_id === currentAlbumId}
        onClick={onClick}
        onDoubleClick={onAlbumDoubleClick}
        onContextMenu={onAlbumContextMenu}/>
    );
  }

	return (
    <div className="album-grid" data-key-catch="useGrid" ref={grid} id={`ag-${albums.length}`}>
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
