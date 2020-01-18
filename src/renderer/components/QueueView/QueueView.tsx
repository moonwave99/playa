import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { playerSelector } from '../../store/modules/player';
import { AlbumListView } from '../AlbumListView/AlbumListView';
import { Album } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { playTrack } from '../../store/modules/player';
import { showContextMenu, updateTitle } from '../../store/modules/ui';
import { toObj } from '../../utils/storeUtils';
import { ContextMenuTypes } from '../../utils/contextMenuUtils';
import './QueueView.scss';

type QueueViewProps = {

};

export const QueueView: FC<QueueViewProps> = () => {
  const dispatch = useDispatch();
  const {
		currentPlaylist,
    currentAlbum,
    currentTrack,
		queue
  } = useSelector(playerSelector);

  useEffect(() => {
    dispatch(updateTitle(`playback queue: ${queue.length} albums`));
  }, []);

  function onAlbumContextMenu(album: Album): void {
    dispatch(showContextMenu({
      type: ContextMenuTypes.ALBUM_COVER,
      context: album
    }));
  }

  function onAlbumDoubleClick(album: Album, track: Track): void {
    dispatch(playTrack({
      playlistId: currentPlaylist ? currentPlaylist._id : null,
      albumId: album._id,
      trackId: track ? track._id : null
    }));
  }

	return (
		<section className="queue">
      <h1>playback queue</h1>
      { queue.length > 0
        ? <AlbumListView
            sortable={false}
            albums={toObj(queue)}
            originalOrder={queue.map(({ _id }) => _id)}
            currentAlbumId={currentAlbum ? currentAlbum._id : null}
            currentTrackId={currentTrack ? currentTrack._id : null}
            onAlbumContextMenu={onAlbumContextMenu}
            onAlbumDoubleClick={onAlbumDoubleClick}/>
        : <p className="queue-empty-placeholder">Queue is empty.</p>
      }
		</section>
	);
}
