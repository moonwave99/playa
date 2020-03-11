import { ipcRenderer as ipc } from 'electron';
import React, { ReactElement, useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { getLatestRequest } from '../../store/modules/library';
import { LatestAlbumsView } from './LatestAlbumsView/LatestAlbumsView';
import { ImportView } from './ImportView/ImportView';
import { ArtistListView } from './ArtistListView/ArtistListView';

import { ApplicationState } from '../../store/store';
import { updateTitle } from '../../store/modules/ui';
import { Album, saveAlbumRequest } from '../../store/modules/album';
import { Track, getTrackListRequest } from '../../store/modules/track';
import { addAlbumsToLibrary } from '../../store/modules/library';
import { showDialog } from '../../store/modules/ui';
import { openContextMenu } from '../../lib/contextMenu';
import { selectFolderDialog } from '../../lib/dialog';
import useNativeDrop, { NativeTypes } from '../../hooks/useNativeDrop/useNativeDrop';

import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActionsGroups,
  AlbumActions
} from '../../actions/albumActions';

import {
  LIBRARY_CONTENT_CONTEXT_ACTIONS,
  LibraryContentActionGroups
} from '../../actions/libraryContentActions';

import actionsMap from '../../actions/actions';
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

  const [folderToImport, setFolderToImport] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [tracksToImport, setTracksToImport] = useState([]);

	const {
    latest,
    latestAlbumId,
    currentAlbumId
  } = useSelector(({ albums, library, player }: ApplicationState) => ({
    latest: library.latest.map((_id: Album['_id']) => albums.allById[_id]),
    latestAlbumId: library.latestAlbumId,
    currentAlbumId: player.currentAlbumId
  }));

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

  function onDrop(folder: string): void {
    showImportDialog(folder);
  }

  const {
    isOver,
    canDrop,
    drop
  } = useNativeDrop({
    onDrop,
    accept: [NativeTypes.FILE],
    filter: (type: string) => type === ''
  });

	useEffect(() => {
		dispatch(
			getLatestRequest(
				daysAgo({ days: LIBRARY_LATEST_DAY_COUNT }),
				LIBRARY_LATEST_ALBUM_LIMIT
			)
		);
	}, []);

	useEffect(() => {
    dispatch(updateTitle(t('library.title')));
  }, []);

	function onAlbumContextMenu(album: Album): void {
		openContextMenu([
      {
        type: ALBUM_CONTEXT_ACTIONS,
        albums: [album],
        dispatch,
        actionGroups: [
          AlbumActionsGroups.PLAYBACK,
          AlbumActionsGroups.ENQUEUE,
          AlbumActionsGroups.SYSTEM,
          AlbumActionsGroups.SEARCH_ONLINE
        ]
      },
      {
        type: LIBRARY_CONTENT_CONTEXT_ACTIONS,
        selection: [album],
        dispatch,
        currentAlbumId,
        actionGroups: [
          LibraryContentActionGroups.ALBUMS
        ]
      }
    ]);
	}

	function onAlbumDoubleClick(album: Album): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      albums: [album],
      queue: [album._id],
      dispatch
    }).handler();
	}

  async function onAddAlbumButtonClick(): Promise<void> {
    const folder = await selectFolderDialog();
    if (!folder) {
      return;
    }
    showImportDialog(folder);
  }

  function onImportModalRequestClose(): void {
    setShowImportModal(false)
  }

  function onImportFormSubmit(album: Album, tracklist: Track[]): void {
    const updatedAlbum = { ...album, _id: `${+latestAlbumId + 1}`}
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

  const libraryClasses = cx('library', {
    'drag-is-over': isOver,
    'drag-can-drop': canDrop
  });

	return (
		<section className={libraryClasses} ref={drop}>
      <button className="button button-add-album" onClick={onAddAlbumButtonClick}>
        <FontAwesomeIcon className="button-icon" icon="plus"/> {t('library.buttons.addNewAlbum')}
      </button>
      <LatestAlbumsView
        albums={latest}
        currentAlbumId={currentAlbumId}
        onAlbumContextMenu={onAlbumContextMenu}
        onAlbumDoubleClick={onAlbumDoubleClick}/>
      { latest.length > 0 ? <ArtistListView/> : null }
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
