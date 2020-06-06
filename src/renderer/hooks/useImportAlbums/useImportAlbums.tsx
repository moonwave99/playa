import { ipcRenderer as ipc } from 'electron';
import React, { ReactElement, useState } from 'react';
import { useDispatch } from 'react-redux';
import ReactModal from 'react-modal';
import { useTranslation } from 'react-i18next';
import { ImportView } from '../../components/LibraryView/ImportView/ImportView';
import { Album } from '../../store/modules/album';
import { Artist } from '../../store/modules/artist';
import { Track } from '../../store/modules/track';
import { importAlbum } from '../../store/modules/library';
import { showDialog } from '../../store/modules/ui';

import {
  IPC_MESSAGES
} from '../../../constants';

const {
  IPC_ALBUM_EXISTS,
  IPC_ALBUM_CONTENT_RAW_REQUEST,
  IPC_TRACK_GET_LIST_RAW_REQUEST
} = IPC_MESSAGES;

type OnImportFormSubmitParams = {
  album: Album;
  artist: Artist;
  tracks: Track[];
}

export default function useImportAlbums(appElement: HTMLElement): {
  show: (folder: string) => Promise<void>;
  render: () => ReactElement;
} {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [folderToImport, setFolderToImport] = useState(null);
  const [tracksToImport, setTracksToImport] = useState([]);
  const [albumTitle, setAlbumTitle] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  async function show(folder: string): Promise<void> {
    const folderAlreadyImported = await ipc.invoke(IPC_ALBUM_EXISTS, folder);
    if (folderAlreadyImported) {
      dispatch(
        showDialog(
          t('library.dialogs.albumAlreadyExists.title'),
          t('library.dialogs.albumAlreadyExists.message', { folder })
        )
      );
      return;
    }

    const folderTracks = await ipc.invoke(IPC_ALBUM_CONTENT_RAW_REQUEST, folder);
    if (folderTracks.length === 0) {
      dispatch(
        showDialog(
          t('library.dialogs.tracksNotFound.title'),
          t('library.dialogs.tracksNotFound.message')
        )
      );
      return;
    }

    const {
      tracks,
      albumTitle
    } = await ipc.invoke(IPC_TRACK_GET_LIST_RAW_REQUEST, folderTracks);
    setFolderToImport(folder);
    setTracksToImport(tracks);
    setAlbumTitle(albumTitle);
    setShowImportModal(true);
  }

  function onImportModalRequestClose(): void {
    setShowImportModal(false);
    setFolderToImport(null);
    setTracksToImport([]);
  }

  function onImportFormSubmit({
    album,
    artist,
    tracks
  }: OnImportFormSubmitParams): void {
    dispatch(importAlbum({ album, artist, tracks }));
    setShowImportModal(false);
    setFolderToImport(null);
    setTracksToImport([]);
  }

  function render(): ReactElement {
    if (!showImportModal) {
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
        onRequestClose={onImportModalRequestClose}
        isOpen={showImportModal}>
        <ImportView
          albumTitle={albumTitle}
          tracks={tracksToImport}
          folderToImport={folderToImport}
          onFormSubmit={onImportFormSubmit}/>
      </ReactModal>
    );
  }

  return {
    show,
    render
  };
}
