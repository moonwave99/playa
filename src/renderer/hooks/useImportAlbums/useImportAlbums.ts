import { ipcRenderer as ipc } from 'electron';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Album, saveAlbumRequest } from '../../store/modules/album';
import { Artist, saveArtistRequest } from '../../store/modules/artist';
import { Track, getTrackListRequest } from '../../store/modules/track';
import { addAlbumsToLibrary } from '../../store/modules/library';
import { showDialog } from '../../store/modules/ui';

import {
  IPC_MESSAGES
} from '../../../constants';

const {
  IPC_ALBUM_EXISTS,
  IPC_ALBUM_CONTENT_RAW_REQUEST,
  IPC_TRACK_GET_LIST_RAW_REQUEST
} = IPC_MESSAGES;

type UseImportAlbumsParams = {
  latestAlbumId: Album['_id'];
  latestArtistId: Artist['_id'];
}

type OnImportFormSubmitParams = {
  album: Album;
  artist: Artist;
  tracks: Track[];
}

export default function useImportAlbums({
  latestAlbumId,
  latestArtistId
}: UseImportAlbumsParams): {
  folderToImport: string;
  tracksToImport: Track[];
  showImportModal: boolean;
  showImportDialog: (folder: string) => Promise<void>;
  onImportModalRequestClose: () => void;
  onImportFormSubmit: (params: OnImportFormSubmitParams) => void;
} {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [folderToImport, setFolderToImport] = useState(null);
  const [tracksToImport, setTracksToImport] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);

  async function showImportDialog(folder: string): Promise<void> {
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

    const processedTracks = await ipc.invoke(IPC_TRACK_GET_LIST_RAW_REQUEST, folderTracks);

    setFolderToImport(folder);
    setTracksToImport(processedTracks);
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
    if (!album.isAlbumFromVA) {
      dispatch(saveArtistRequest({
        ...artist,
        count: artist.count + 1,
        _id: artist._id || `${+latestArtistId + 1}`
      }));
    }
    const updatedAlbum = {
      ...album,
      _id: `${+latestAlbumId + 1}`,
      artist: artist._id || `${+latestArtistId + 1}`
    };
    dispatch(
      getTrackListRequest(
        tracks.map(({ _id }) => _id )
      )
    );
    dispatch(saveAlbumRequest(updatedAlbum));
    dispatch(addAlbumsToLibrary([updatedAlbum]));
    setShowImportModal(false);
    setFolderToImport(null);
    setTracksToImport([]);
  }

  return {
    folderToImport,
    tracksToImport,
    showImportModal,
    showImportDialog,
    onImportModalRequestClose,
    onImportFormSubmit
  }
}
