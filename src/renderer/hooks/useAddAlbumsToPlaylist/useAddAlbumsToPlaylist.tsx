import React, { ReactElement, useState } from 'react';
import ReactModal from 'react-modal';
import { AddAlbumsToPlaylistView } from '../../components/AddAlbumsToPlaylistView/AddAlbumsToPlaylistView';
import { Playlist } from '../../store/modules/playlist';
import { Album } from '../../store/modules/album';

export default function useAddAlbumsToPlaylist({
  appElement,
  onCreatePlaylist,
  onSavePlaylist
}: {
  appElement: HTMLElement;
  onCreatePlaylist: Function;
  onSavePlaylist: Function;
}): {
  show: (albumIDs: Album['_id'][]) => void;
  render: () => ReactElement;
} {
  const [albumIDs, setAlbumIDs] = useState([] as Album['_id'][]);
  const [showModal, setShowModal] = useState(false);

  function show(albumIDs: Album['_id'][]): void {
    setAlbumIDs(albumIDs);
    setShowModal(true);
  }

  function onModalRequestClose(): void {
    setShowModal(false);
  }

  function onPlaylistClick(playlist: Playlist): void {
    if (!playlist) {
      onCreatePlaylist(albumIDs);
    } else {
      onSavePlaylist(playlist, albumIDs);
    }
    setShowModal(false);
  }

  function render(): ReactElement {
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
        <AddAlbumsToPlaylistView
          albumIDs={albumIDs}
          onPlaylistClick={onPlaylistClick}/>
      </ReactModal>
    );
  }

  return {
    show,
    render
  };
}
