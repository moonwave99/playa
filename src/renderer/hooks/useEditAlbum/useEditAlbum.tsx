import React, { ReactElement, useState } from 'react';
import { useDispatch } from 'react-redux';
import ReactModal from 'react-modal';
import { EditAlbumView } from '../../components/LibraryView/EditAlbumView/EditAlbumView'
import { Album, editAlbum, updateAlbum } from '../../store/modules/album';
import { Artist } from '../../store/modules/artist';

export default function useEditAlbum(appElement: HTMLElement): {
  show: (album: Album) => void;
  render: () => ReactElement;
} {
  const dispatch = useDispatch();
  const [album, setAlbum] = useState();
  const [showModal, setShowModal] = useState(false);

  function show(album: Album): void {
    setAlbum(album);
    setShowModal(true);
  }

  function onModalRequestClose(): void {
    dispatch(editAlbum({} as Album));
    setShowModal(false);
  }

  function onFormSubmit({ album: updatedAlbum, artist }: {
    album: Album;
    artist: Artist;
  }): void {
    dispatch(updateAlbum(updatedAlbum, artist));
    dispatch(editAlbum({} as Album));
    setShowModal(false);
  }

  function render(): ReactElement {
    if (!album) {
      return null;
    }
    return (
      <ReactModal
        appElement={appElement}
        className={{
          base: 'modal-content',
          beforeClose: 'modal-content-before-close',
          afterOpen: 'modal-content-after-open'
        }}
        overlayClassName={{
          base: 'modal-overlay',
          beforeClose: 'modal-overlay-before-close',
          afterOpen: 'modal-overlay-after-open'
        }}
        shouldFocusAfterRender={true}
        onRequestClose={onModalRequestClose}
        isOpen={showModal}>
        <EditAlbumView
          album={album}
          onFormSubmit={onFormSubmit}/>
      </ReactModal>
    );
  }

  return {
    show,
    render
  };
}
