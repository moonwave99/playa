import React, { FC } from 'react';
import { AlbumGridTileView } from './AlbumGridTileView/AlbumGridTileView';
import { Album } from '../../../store/modules/album';

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
	return (
    <section className="album-grid">
      {albums.map(album =>
        <AlbumGridTileView
          key={album._id}
          album={album}
          isPlaying={album._id === currentAlbumId}
          onDoubleClick={onAlbumDoubleClick}
          onContextMenu={onAlbumContextMenu}/>
      )}
    </section>
	);
}
