import { ipcRenderer as ipc, Event } from 'electron';
import React, { ReactElement, FC, useState, useEffect } from 'react';
import cx from 'classnames';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { PlaylistViewTitle } from './PlaylistViewTitle/PlaylistViewTitle';
import { AlbumListView } from '../AlbumListView/AlbumListView';
import { ActionsConfig } from '../AlbumListView/AlbumActionsView/AlbumActionsView';
import { Playlist } from '../../store/modules/playlist';
import { Album } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { UIAlbumView, UIDragTypes } from '../../store/modules/ui';
import { EntityHashMap } from '../../utils/storeUtils';
import { formatDate } from '../../utils/datetimeUtils';
import './PlaylistView.scss';

import { IPC_MESSAGES } from '../../../constants';
const { IPC_UI_TOGGLE_ALBUM_VIEW } = IPC_MESSAGES;

type PlaylistViewProps = {
  albums: EntityHashMap<Album>;
  playlist: Playlist;
  isCurrent: boolean;
  currentAlbumId: Album['_id'];
  currentTrackId: Track['_id'];
  albumActions: ActionsConfig[];
  onTitleChange: Function;
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
  albumActions,
  onAlbumOrderChange,
  onTitleChange,
  onAlbumContextMenu,
  onAlbumDoubleClick
}) => {
  const { t } = useTranslation();
  const [albumView, setAlbumView] = useState(UIAlbumView.Extended);
  const hasAlbums = Object.keys(albums).length > 0 && playlist.albums.length > 0;

  useEffect(() => {
    const handler = (_event: Event, _albumView: UIAlbumView): void => {
      setAlbumView(_albumView);
    };
    ipc.on(IPC_UI_TOGGLE_ALBUM_VIEW, handler);
    return (): typeof ipc => ipc.removeListener(IPC_UI_TOGGLE_ALBUM_VIEW, handler);
  }, []);


  function renderToggleViewButton(): ReactElement {
    const { icon, i18nkey, otherView } = {
      icon: albumView === UIAlbumView.Compact ? 'th-list' : 'list-alt',
      i18nkey: `playlists.toggleView.show${albumView === UIAlbumView.Compact ? 'Extended' : 'Compact'}`,
      otherView: albumView === UIAlbumView.Compact ? UIAlbumView.Extended : UIAlbumView.Compact
    };
    function onButtonClick(): void {
      setAlbumView(otherView);
    }
    return (
      <button
        className="playlist-toggle-view-button"
        onClick={onButtonClick}>
        <FontAwesomeIcon icon={icon as IconName} className="button-icon"/>
        {t(i18nkey)}
      </button>
    );
  }

  const date = formatDate({
    date: playlist.created,
    options: { year: 'numeric', month: 'long', day: 'numeric' }
  });

  const playlistClasses = cx('playlist-view', { 'is-current': isCurrent });
	return (
		<section className={playlistClasses}>
      <header className="playlist-header">
        <div className="playlist-header-row">
          <PlaylistViewTitle
            playlist={playlist}
            onTitleChange={onTitleChange}/>
        </div>
        <p className="playlist-info header-like">
          <span>{t('playlists.createdOn', { date })}</span>
          { renderToggleViewButton() }
        </p>
      </header>
      { hasAlbums
        ? <AlbumListView
            sortable={true}
            albums={albums}
            albumView={albumView}
            originalOrder={playlist.albums}
            currentAlbumId={currentAlbumId}
            currentTrackId={currentTrackId}
            albumActions={albumActions}
            dragType={UIDragTypes.PLAYLIST_ALBUMS}
            onAlbumOrderChange={onAlbumOrderChange}
            onAlbumContextMenu={onAlbumContextMenu}
            onAlbumDoubleClick={onAlbumDoubleClick}/>
        : <p className="playlist-empty-placeholder">{t('playlists.empty')}</p>
      }
    </section>
	);
}
