import { ipcRenderer as ipc } from 'electron';
import React, { ReactElement, useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getLatestRequest } from '../../store/modules/library';
import { AlbumGridView } from './AlbumGridView/AlbumGridView';
import { ImportView } from './ImportView/ImportView';
import { updateTitle } from '../../store/modules/ui';
import { Album, saveAlbumRequest } from '../../store/modules/album';
import { Track, getTrackListRequest } from '../../store/modules/track';
import { addAlbumsToLibrary } from '../../store/modules/library';
import { playTrack, updateQueue } from '../../store/modules/player';
import { confirmDialog } from '../../lib/dialog';
import { openContextMenu } from '../../lib/contextMenu/contextMenu';
import { selectFolderDialog } from '../../lib/dialog';
import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActionItems
} from '../../lib/contextMenu/actions/album';

import {
  LIBRARY_CONTENT_CONTEXT_ACTIONS,
  LibraryContentActionItems
} from '../../lib/contextMenu/actions/libraryContent';

import { daysAgo } from '../../utils/datetimeUtils';

import {
  LIBRARY_LATEST_ALBUM_LIMIT,
	LIBRARY_LATEST_DAY_COUNT,
  IPC_MESSAGES
} from '../../../constants';

const {
  IPC_ALBUM_EXISTS,
  IPC_ALBUM_CONTENT_RAW_REQUEST,
  IPC_TRACK_GET_LIST_RAW_REQUEST
} = IPC_MESSAGES;

import './LibraryView.scss';

export const LibraryView = (): ReactElement => {
  const { t } = useTranslation();
	const dispatch = useDispatch();
	const {
    latest,
    latestAlbumID,
    playingAlbumID
  } = useSelector(({ library, player }) => ({
    ...library,
    playingAlbumID: player.currentAlbumId
  }));
	useEffect(() => {
		dispatch(
			getLatestRequest(
				daysAgo({ days: LIBRARY_LATEST_DAY_COUNT }),
				LIBRARY_LATEST_ALBUM_LIMIT
			)
		);
	}, []);
  const [folderToImport, setFolderToImport] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [tracksToImport, setTracksToImport] = useState([]);

	useEffect(() => {
    dispatch(updateTitle('Library'));
  }, []);

	function onAlbumContextMenu(album: Album): void {
		openContextMenu([
      {
        type: ALBUM_CONTEXT_ACTIONS,
        album,
        dispatch,
        actions: [
          AlbumActionItems.PLAYBACK,
          AlbumActionItems.ENQUEUE,
          AlbumActionItems.SYSTEM,
          AlbumActionItems.SEARCH_ONLINE
        ]
      },
      {
        type: LIBRARY_CONTENT_CONTEXT_ACTIONS,
        selection: [album],
        dispatch,
        playingAlbumID,
        actions: [
          LibraryContentActionItems.REMOVE_ALBUMS
        ]
      }
    ]);
	}

	function onAlbumDoubleClick({ _id: albumId }: Album): void {
		dispatch(updateQueue([albumId]));
		dispatch(playTrack({ albumId }));
	}

  async function onAddAlbumButtonClick(): Promise<void> {
    const folder = await selectFolderDialog();
    if (!folder) {
      return;
    }

    const folderAlreadyImported = await ipc.invoke(IPC_ALBUM_EXISTS, folder);
    if (folderAlreadyImported) {
      confirmDialog({
        title: t('library.dialogs.albumAlreadyExists.title'),
        message: t('library.dialogs.albumAlreadyExists.message', { folder }),
        buttons: ['OK']
      });
      return;
    }

    const folderTracks = await ipc.invoke(IPC_ALBUM_CONTENT_RAW_REQUEST, folder);
    if (folderTracks.length === 0) {
      confirmDialog({
        title: t('library.dialogs.tracksNotFound.title'),
        message: t('library.dialogs.tracksNotFound.message'),
        buttons: ['OK']
      });
      return;
    }

    const processedTracks = await ipc.invoke(IPC_TRACK_GET_LIST_RAW_REQUEST, folderTracks);
    setFolderToImport(folder);
    setTracksToImport(processedTracks);
    setShowImportModal(true);
  }

  function onImportModalRequestClose(): void {
    setShowImportModal(false)
  }

  function onImportFormSubmit(album: Album, tracklist: Track[]): void {
    const updatedAlbum = { ...album, _id: `${+latestAlbumID + 1}`}
    dispatch(
      getTrackListRequest(
        tracklist.map(({ _id }) => _id )
      )
    );
    dispatch(saveAlbumRequest(updatedAlbum));
    dispatch(addAlbumsToLibrary([updatedAlbum]));
    setShowImportModal(false);
    setFolderToImport(null);
    setTracksToImport([]);
  }

	return (
		<section className="library">
      <header>
        <h1>{t('library.title')}</h1>
        <button className="button button-add-album" onClick={onAddAlbumButtonClick}>
          <FontAwesomeIcon className="button-icon" icon="plus"/> {t('library.buttons.addNewAlbum')}
        </button>
      </header>
			<AlbumGridView
				albums={latest}
				onAlbumContextMenu={onAlbumContextMenu}
				onAlbumDoubleClick={onAlbumDoubleClick}/>
      <ReactModal
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
          tracks={tracksToImport}
          folderToImport={folderToImport}
          onFormSubmit={onImportFormSubmit}/>
      </ReactModal>
		</section>
	);
}
