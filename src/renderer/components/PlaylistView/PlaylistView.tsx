import React, { FC, useState, useEffect, useCallback } from 'react';
import cx from 'classnames';
import { useTranslation } from 'react-i18next';
import { AlbumDetailView } from './AlbumDetailView/AlbumDetailView';
import { CompactAlbumListView } from '../CompactAlbumListView/CompactAlbumListView';
import { Playlist } from '../../store/modules/playlist';
import { Album } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { UIDragTypes } from '../../store/modules/ui';
import { EntityHashMap, immutableMove } from '../../utils/storeUtils';

import './PlaylistView.scss';
import '../CompactAlbumListView/CompactAlbumListView.scss';
import '../CompactAlbumListView/CompactAlbumView/CompactAlbumView.scss';

type PlaylistViewProps = {
  albums: EntityHashMap<Album>;
  playlist: Playlist;
  isCurrent?: boolean;
  currentAlbumId: Album['_id'];
  currentTrackId: Track['_id'];
  onSelectionChange: Function;
  onAlbumOrderChange: Function;
  onAlbumEnter: Function;
  onAlbumBackspace: Function;
  onAlbumContextMenu: Function;
  onAlbumDoubleClick: Function;
};

export const PlaylistView: FC<PlaylistViewProps> = ({
  albums,
  playlist,
  isCurrent = false,
  currentAlbumId,
  currentTrackId,
  onSelectionChange,
  onAlbumOrderChange,
  onAlbumEnter,
  onAlbumBackspace,
  onAlbumContextMenu,
  onAlbumDoubleClick
}) => {
  const { t } = useTranslation();
  const [selectedAlbumId, setSelectedAlbumId] = useState(
    playlist.albums ? playlist.albums[0] : null
  );
  const [albumOrder, setAlbumOrder] = useState(playlist.albums || []);
  const hasAlbums = playlist.albums.length > 0 && Object.keys(albums).length > 0;

  const onAlbumMove = useCallback(
    (dragIndex: number, hoverIndex: number): void => {
      const newOrder = immutableMove<Album['_id']>(albumOrder, dragIndex, hoverIndex);
      setAlbumOrder(newOrder);
      onAlbumOrderChange(newOrder);
    }
    , [albumOrder]
  );

  useEffect(() => {
    setAlbumOrder(playlist.albums);
    setSelectedAlbumId(playlist.albums[0]);
  }, [playlist.albums])

  function _onSelectionChange(_ids: Album['_id'][]): void {
    onSelectionChange(_ids);
    if (_ids.length > 1) {
      return;
    }
    setSelectedAlbumId(_ids[0]);
  }

  const playlistClasses = cx('playlist-view', { 'is-current': isCurrent });

  if (!hasAlbums) {
    return (
      <section className={playlistClasses}>
        <p className="playlist-empty-placeholder">{t('playlists.empty')}</p>
      </section>
    );
  }

	return (
		<section className={playlistClasses}>
      <div className="album-list-wrapper">
        <CompactAlbumListView
          albums={albumOrder.map(_id => albums[_id])}
          currentAlbumId={currentAlbumId}
          sortable={true}
          onSelectionChange={_onSelectionChange}
          onAlbumMove={onAlbumMove}
          onEnter={onAlbumEnter}
          onBackspace={onAlbumBackspace}
          onAlbumContextMenu={onAlbumContextMenu}
          onAlbumDoubleClick={onAlbumDoubleClick}/>
      </div>
      <div className="album-detail-wrapper">
      { albums[selectedAlbumId] && <AlbumDetailView
        album={albums[selectedAlbumId]}
        currentTrackId={currentTrackId}
        dragType={UIDragTypes.PLAYLIST_ALBUMS}
        onDoubleClick={onAlbumDoubleClick}
        onContextMenu={onAlbumContextMenu}/> }
      </div>
    </section>
	);
}
