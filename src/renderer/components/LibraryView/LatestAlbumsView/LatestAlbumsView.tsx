import React, { FC, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { AlbumGridView } from '../AlbumGridView/AlbumGridView';

import { Album } from '../../../store/modules/album';

type LatestAlbumsViewProps = {
  albums: Album[];
  currentAlbumId: Album['_id'];
  onAlbumContextMenu: Function;
  onAlbumDoubleClick: Function;
};

export const LatestAlbumsView: FC<LatestAlbumsViewProps> = ({
  albums = [],
  currentAlbumId,
  onAlbumContextMenu,
  onAlbumDoubleClick
}) => {
  const { t } = useTranslation();

  function renderAlbums(): ReactElement {
    return (
      <AlbumGridView
        albums={albums}
        currentAlbumId={currentAlbumId}
        onAlbumContextMenu={onAlbumContextMenu}
        onAlbumDoubleClick={onAlbumDoubleClick}/>
    );
  }

  return (
    <section className="library-latest-albums">
      <h1>{t('library.latest.title')}</h1>
      { albums.length
        ? renderAlbums()
        : <p className="library-latest-albums-empty-placeholder">{t('library.empty')}</p>
      }
    </section>
  );
}
