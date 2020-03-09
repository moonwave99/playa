import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
	return (
    <section className="album-grid">
      {albums.length > 0 ? albums.map(album =>
        <AlbumGridTileView
          key={album._id}
          album={album}
          isPlaying={album._id === currentAlbumId}
          onDoubleClick={onAlbumDoubleClick}
          onContextMenu={onAlbumContextMenu}/>
      ) : <p className="album-grid-empty-placeholder">{t('library.empty')}</p>}
    </section>
	);
}
