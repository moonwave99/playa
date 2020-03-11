import React, { FC, ReactElement } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useTranslation } from 'react-i18next';

import { AlbumGridView } from '../AlbumGridView/AlbumGridView';

import { Album } from '../../../store/modules/album';

type LatestAlbumsViewProps = {
  albums: Album[];
  currentAlbumId: Album['_id'];
  loading: boolean;
  onAlbumContextMenu: Function;
  onAlbumDoubleClick: Function;
};

export const LatestAlbumsView: FC<LatestAlbumsViewProps> = ({
  albums = [],
  currentAlbumId,
  loading = false,
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

  function renderEmptyPlaceholder(): ReactElement {
    return <p className="library-latest-albums-empty-placeholder">{t('library.empty')}</p>;
  }

  return (
    <section className="library-latest-albums">
      <h1>{t('library.latest.title')}</h1>
      <CSSTransition
        in={!loading}
        timeout={300}
        classNames="album-grid"
        unmountOnExit>
        { albums.length
          ? renderAlbums()
          : renderEmptyPlaceholder()
        }
      </CSSTransition>
    </section>
  );
}
