import React, { FC, useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { getLatestRequest } from '../../store/modules/library';
import { LatestAlbumsView } from './LatestAlbumsView/LatestAlbumsView';
import { ArtistListView } from './ArtistListView/ArtistListView';

import { ApplicationState } from '../../store/store';
import { updateTitle } from '../../store/modules/ui';
import { Album } from '../../store/modules/album';
import { Artist } from '../../store/modules/artist';
import { openContextMenu } from '../../lib/contextMenu';
import useNativeDrop, { NativeTypes } from '../../hooks/useNativeDrop/useNativeDrop';
import scrollTo from '../../lib/scrollTo';

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
	LIBRARY_LATEST_DAY_COUNT
} from '../../../constants';

import {
  LIBRARY
} from '../../routes';

import './LibraryView.scss';

const DEFAULT_LETTER = 'a';

type LibraryViewProps = {
	onDrop: Function;
};

export const LibraryView: FC<LibraryViewProps> = ({
  onDrop
}) => {
  const { t } = useTranslation();
	const dispatch = useDispatch();
  const location = useLocation();
	const history = useHistory();
  const [selectedLetter, setSelectedLetter] = useState(DEFAULT_LETTER);

  const q = new URLSearchParams(location.search);
  const letter = q.get('letter');

  useEffect(() => {
    if (letter) {
      setSelectedLetter(letter);
    }
  }, [letter]);

	const {
    latest,
    currentAlbumId,
    loadingLatest
  } = useSelector(({ albums, library, player }: ApplicationState) => ({
    latest: library.latest.map((_id: Album['_id']) => albums.allById[_id]),
    currentAlbumId: player.currentAlbumId,
    loadingLatest: library.loadingLatest
  }));

  function _onDrop(folder: string): void {
    onDrop(folder);
  }

  const {
    isOver,
    canDrop,
    drop
  } = useNativeDrop({
    onDrop: _onDrop,
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

	function onAlbumContextMenu(album: Album, artist: Artist): void {
		openContextMenu([
      {
        type: ALBUM_CONTEXT_ACTIONS,
        albums: [{ album, artist }],
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

	function onAlbumDoubleClick(album: Album, artist: Artist): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      albums: [{ album, artist }],
      queue: [album._id],
      dispatch
    }).handler();
	}

  function onLetterClick(letter: string): void {
    setSelectedLetter(letter);
    history.replace(
      `${LIBRARY}?letter=${letter}`
    );
    scrollTo({
      selector: '.alphabet',
      block: 'start',
      behavior: 'smooth'
    });
  }

  const libraryClasses = cx('library', {
    'drag-is-over': isOver,
    'drag-can-drop': canDrop
  });

	return (
		<section className={libraryClasses} ref={drop}>
      <LatestAlbumsView
        albums={latest}
        currentAlbumId={currentAlbumId}
        loading={loadingLatest}
        onAlbumContextMenu={onAlbumContextMenu}
        onAlbumDoubleClick={onAlbumDoubleClick}/>
      {
        latest.length > 0
        ? <ArtistListView
            selectedLetter={selectedLetter}
            onLetterClick={onLetterClick}/>
        : null
      }
		</section>
	);
}
