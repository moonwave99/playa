import React, { ReactElement, useEffect } from 'react';
import { findDOMNode } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { playerSelector } from '../../store/modules/player';
import { AlbumListView } from '../AlbumListView/AlbumListView';
import { Album } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { playTrack } from '../../store/modules/player';
import { updateTitle, UIAlbumView, UIDragTypes } from '../../store/modules/ui';
import { toObj } from '../../utils/storeUtils';
import { openContextMenu } from '../../lib/contextMenu';
import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActionsGroups
} from '../../actions/albumActions';

import './QueueView.scss';

export const QueueView = (): ReactElement => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
		currentPlaylist,
    currentAlbum,
    currentAlbumId,
    currentTrack,
		queue
  } = useSelector(playerSelector);

  useEffect(() => {
    dispatch(updateTitle(t('queue.title', { length: queue.length })));
  }, [queue.length]);

  useEffect(() => {
    const target = findDOMNode(document.getElementById(currentAlbumId)) as HTMLElement;
    if (!target) {
      return;
    }
    setImmediate(() => {
      target.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
    });
  }, [currentAlbumId]);

  function onAlbumContextMenu(album: Album): void {
    openContextMenu([
      {
        type: ALBUM_CONTEXT_ACTIONS,
        albums: [album],
        queue: queue.map(({ _id }) => _id),
        dispatch,
        actionGroups: [
          AlbumActionsGroups.QUEUE,
          AlbumActionsGroups.PLAYBACK,
          AlbumActionsGroups.SYSTEM,
          AlbumActionsGroups.SEARCH_ONLINE
        ]
      }
    ]);
  }

  function onAlbumDoubleClick(album: Album, track: Track): void {
    dispatch(playTrack({
      playlistId: currentPlaylist ? currentPlaylist._id : null,
      albumId: album._id,
      trackId: track ? track._id : null
    }));
  }

	return (
		<section className="queue" id="queue">
      { queue.length > 0
        ? <AlbumListView
            albumView={UIAlbumView.Extended}
            sortable={false}
            albums={toObj(queue)}
            originalOrder={queue.map(({ _id }) => _id)}
            currentAlbumId={currentAlbum ? currentAlbum._id : null}
            currentTrackId={currentTrack ? currentTrack._id : null}
            dragType={UIDragTypes.QUEUE_ALBUMS}
            onAlbumContextMenu={onAlbumContextMenu}
            onAlbumDoubleClick={onAlbumDoubleClick}/>
        : <p className="queue-empty-placeholder">{t('queue.empty')}</p>
      }
		</section>
	);
}
