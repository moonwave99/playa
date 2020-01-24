import React, { ReactElement, FC } from 'react';
import { AlbumGridTileView } from './AlbumGridTileView/AlbumGridTileView';
import { Album } from '../../../store/modules/album';
import { LIBRARY_GRID_COLUMN_COUNT } from '../../../../constants';

import './AlbumGridView.scss';

type AlbumGridViewProps = {
  albums: Album[];
  currentAlbumId: Album['_id'];
  onAlbumContextMenu: Function;
  onAlbumDoubleClick: Function;
};

export const AlbumGridView: FC<AlbumGridViewProps> = ({
  albums,
  currentAlbumId,
  onAlbumContextMenu,
  onAlbumDoubleClick
}) => {

  function renderAlbum(album: Album): ReactElement {
    return (
      <AlbumGridTileView
        key={album._id}
        album={album}
        isPlaying={album._id === currentAlbumId}
        onDoubleClick={onAlbumDoubleClick}
        onContextMenu={onAlbumContextMenu}/>
    );
  }

  const rows = albums.reduce((memo, item, index) => {
    const rowIndex = Math.floor(index / LIBRARY_GRID_COLUMN_COUNT);
    if (!memo[rowIndex]) {
      memo.push([]);
    }
    memo[rowIndex].push(item);
    return memo;
  }, []);

	return (
    <section className="album-grid">
      {rows.map((row, index) =>
        <div className="album-grid-row" key={index}>
          {row.map(renderAlbum)}
        </div>
      )}
    </section>
	);
}
