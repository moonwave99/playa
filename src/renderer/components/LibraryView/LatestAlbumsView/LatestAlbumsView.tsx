import React, { FC, ReactElement } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useTranslation } from 'react-i18next';
import { AlbumGridView } from '../AlbumGridView/AlbumGridView';
import { Album } from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
import { updateLibraryAlbumSelection } from '../../../store/modules/ui';

type LatestAlbumsViewProps = {
  albums: Album[];
  currentAlbumId: Album['_id'];
  currentTrackId: Track['_id'];
  onAlbumEnter: Function;
  onAlbumBackspace: Function;
  onAlbumContextMenu: Function;
  onAlbumDoubleClick: Function;
};

export const LatestAlbumsView: FC<LatestAlbumsViewProps> = ({
  albums,
  currentAlbumId,
  currentTrackId,
  onAlbumEnter,
  onAlbumBackspace,
  onAlbumContextMenu,
  onAlbumDoubleClick
}) => {
  const { t } = useTranslation();

  function onSelectionChange(selection: Album['_id'][]): void {
    updateLibraryAlbumSelection(selection);
  }

  function renderAlbums(): ReactElement {
    return (
      <AlbumGridView
        autoFocus
        albums={albums}
        currentAlbumId={currentAlbumId}
        currentTrackId={currentTrackId}
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

  if (!albums) {
    return null;
  }

  return (
    <section className="library-latest-albums">
      <CSSTransition
        in={!!albums}
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
