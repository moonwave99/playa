import React, { ReactElement, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getLatestRequest } from '../../store/modules/library';
import { AlbumGridView } from './AlbumGridView/AlbumGridView';
import { updateTitle } from '../../store/modules/ui';
import { Album } from '../../store/modules/album';
import { playTrack, updateQueue } from '../../store/modules/player';
import { openContextMenu } from '../../lib/contextMenu/contextMenu';
import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActionItems
} from '../../lib/contextMenu/actions/album';

import { daysAgo } from '../../utils/datetimeUtils';

import {
  LIBRARY_LATEST_ALBUM_LIMIT,
	LIBRARY_LATEST_DAY_COUNT
} from '../../../constants';

import './LibraryView.scss';

export const LibraryView = (): ReactElement => {
  const { t } = useTranslation();
	const dispatch = useDispatch();
	const latest = useSelector(({ library }) => library.latest);
	useEffect(() => {
		dispatch(
			getLatestRequest(
				daysAgo({ days: LIBRARY_LATEST_DAY_COUNT }),
				LIBRARY_LATEST_ALBUM_LIMIT
			)
		);
	}, []);

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
      }
    ]);
	}

	function onAlbumDoubleClick({ _id: albumId }: Album): void {
		dispatch(updateQueue([albumId]));
		dispatch(playTrack({ albumId }));
	}

	return (
		<section className="library">
      <header>
        <h1>{t('library.title')}</h1>
        <button className="button button-add-album">
          <FontAwesomeIcon className="button-icon" icon="plus"/> {t('library.buttons.addNewAlbum')}
        </button>
      </header>
			<AlbumGridView
				albums={latest}
				onAlbumContextMenu={onAlbumContextMenu}
				onAlbumDoubleClick={onAlbumDoubleClick}/>
		</section>
	);
}
