import React, { FC, ReactElement } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useTranslation } from 'react-i18next';
import { AlbumGridView } from '../AlbumGridView/AlbumGridView';
import { Album } from '../../../store/modules/album';
import { updateAlbumSelection } from '../../../store/modules/ui';

type LatestAlbumsViewProps = {
  albums: Album[];
  currentAlbumId: Album['_id'];
  loading: boolean;
  onAlbumEnter: Function;
  onAlbumBackspace: Function;
  onAlbumContextMenu: Function;
  onAlbumDoubleClick: Function;
};

export const LatestAlbumsView: FC<LatestAlbumsViewProps> = ({
  albums = [],
  currentAlbumId,
  loading = false,
  onAlbumEnter,
  onAlbumBackspace,
  onAlbumContextMenu,
  onAlbumDoubleClick
}) => {
  const { t } = useTranslation();

  function onSelectionChange(selection: Album['_id'][]): void {
    updateAlbumSelection(selection);
  }

  function renderAlbums(): ReactElement {
    return (
      <AlbumGridView
        albums={albums}
        currentAlbumId={currentAlbumId}
        clearSelectionOnBlur
        onSelectionChange={onSelectionChange}
        onEnter={onAlbumEnter}
        onBackspace={onAlbumBackspace}
        onAlbumContextMenu={onAlbumContextMenu}
        onAlbumDoubleClick={onAlbumDoubleClick}/>
    );
  }

  function renderEmptyPlaceholder(): ReactElement {
    return <p className="library-latest-albums-empty-placeholder">{t('library.empty')}</p>;
  }

  return (
    <section className="library-latest-albums">
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
