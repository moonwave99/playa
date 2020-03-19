import { ipcRenderer as ipc, Event } from 'electron';
import React, { FC, useState, useEffect } from 'react';
import cx from 'classnames';
import { useTranslation } from 'react-i18next';
import { AlbumListView } from '../AlbumListView/AlbumListView';
import { Playlist } from '../../store/modules/playlist';
import { Album } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { UIAlbumView, UIDragTypes } from '../../store/modules/ui';
import { EntityHashMap } from '../../utils/storeUtils';
import './PlaylistView.scss';

import { IPC_MESSAGES } from '../../../constants';
const { IPC_UI_TOGGLE_ALBUM_VIEW } = IPC_MESSAGES;

type PlaylistViewProps = {
  albums: EntityHashMap<Album>;
  playlist: Playlist;
  isCurrent?: boolean;
  currentAlbumId: Album['_id'];
  currentTrackId: Track['_id'];
  onAlbumOrderChange: Function;
  onAlbumContextMenu: Function;
  onAlbumDoubleClick: Function;
};

export const PlaylistView: FC<PlaylistViewProps> = ({
  albums,
  playlist,
  isCurrent = false,
  currentAlbumId,
  currentTrackId,
  onAlbumOrderChange,
  onAlbumContextMenu,
  onAlbumDoubleClick
}) => {
  const { t } = useTranslation();
  const [albumView, setAlbumView] = useState(UIAlbumView.Extended);
  const hasAlbums = playlist.albums.length > 0;

  useEffect(() => {
    const handler = (_event: Event, _albumView: UIAlbumView): void => {
      setAlbumView(_albumView);
    };
    ipc.on(IPC_UI_TOGGLE_ALBUM_VIEW, handler);
    return (): typeof ipc => ipc.removeListener(IPC_UI_TOGGLE_ALBUM_VIEW, handler);
  }, []);

  const playlistClasses = cx('playlist-view', { 'is-current': isCurrent });
	return (
		<section className={playlistClasses}>
      { hasAlbums
        ? <AlbumListView
            sortable={true}
            albums={albums}
            albumView={albumView}
            originalOrder={playlist.albums}
            currentAlbumId={currentAlbumId}
            currentTrackId={currentTrackId}
            dragType={UIDragTypes.PLAYLIST_ALBUMS}
            onAlbumOrderChange={onAlbumOrderChange}
            onAlbumContextMenu={onAlbumContextMenu}
            onAlbumDoubleClick={onAlbumDoubleClick}/>
        : <p className="playlist-empty-placeholder">{t('playlists.empty')}</p>
      }
    </section>
	);
}
