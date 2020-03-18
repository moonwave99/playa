import React, { FC } from 'react';
import { AlbumGridTileView } from './AlbumGridTileView/AlbumGridTileView';
import { Album } from '../../../store/modules/album';

import './AlbumGridView.scss';

type AlbumGridViewProps = {
  albums: Album[];
  showArtists?: boolean;
  currentAlbumId?: Album['_id'];
  onAlbumContextMenu?: Function;
  onAlbumDoubleClick?: Function;
};

export const AlbumGridView: FC<AlbumGridViewProps> = ({
  albums = [],
  showArtists = true,
  currentAlbumId,
  onAlbumContextMenu,
  onAlbumDoubleClick
}) => {
	return (
    <div className="album-grid">
      {albums.map(album =>
        <AlbumGridTileView
          showArtist={showArtists}
          key={album._id}
          album={album}
          isPlaying={album._id === currentAlbumId}
          onDoubleClick={onAlbumDoubleClick}
          onContextMenu={onAlbumContextMenu}/>)}
    </div>
	);
}
