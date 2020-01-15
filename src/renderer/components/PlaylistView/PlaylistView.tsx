import { ipcRenderer as ipc, Event } from 'electron';
import React, { ReactElement, FC, useState, useEffect, useCallback } from 'react';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PlaylistViewTitle } from './PlaylistViewTitle/PlaylistViewTitle';
import { AlbumView } from './AlbumView/AlbumView';
import { CompactAlbumView } from './CompactAlbumView/CompactAlbumView';
import { Playlist } from '../../store/modules/playlist';
import { Album } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { UIAlbumView } from '../../store/modules/ui';
import { EntityHashMap, immutableMove } from '../../utils/storeUtils';
import { formatDate } from '../../utils/datetimeUtils';

import { IPC_MESSAGES } from '../../../constants';
const { IPC_UI_TOGGLE_ALBUM_VIEW } = IPC_MESSAGES;

import './PlaylistView.scss';

type PlaylistViewProps = {
  albums: EntityHashMap<Album>;
  playlist: Playlist;
  isCurrent: boolean;
  currentAlbumId: Album['_id'];
  currentTrackId: Track['_id'];
  onTitleChange: Function;
  onAlbumOrderChange: Function;
  onAlbumContextMenu: Function;
};

export const PlaylistView: FC<PlaylistViewProps> = ({
  albums,
  playlist,
  isCurrent = false,
  currentAlbumId,
  currentTrackId,
  onAlbumOrderChange,
  onTitleChange,
  onAlbumContextMenu
}) => {
  const [albumView, setAlbumView] = useState(UIAlbumView.Extended);
  const [albumOrder, setAlbumOrder] = useState([]);
  const hasAlbums = Object.keys(albums).length > 0 && playlist.albums.length > 0;

  useEffect(() => {
    if (playlist.albums.length > 0) {
      setAlbumOrder(playlist.albums);
    }
  }, [playlist.albums]);

  useEffect(() => {
    const handler = (_event: Event, _albumView: UIAlbumView): void => {
      setAlbumView(_albumView);
    };
    ipc.on(IPC_UI_TOGGLE_ALBUM_VIEW, handler);
    return (): typeof ipc => ipc.removeListener(IPC_UI_TOGGLE_ALBUM_VIEW, handler);
  }, []);

  const onAlbumMove = useCallback((dragIndex: number, hoverIndex: number): void => {
    const newOrder = immutableMove<Album['_id']>(albumOrder, dragIndex, hoverIndex);
    setAlbumOrder(newOrder);
  }, [albumOrder]);

  function onDragEnd(): void {
    onAlbumOrderChange(albumOrder);
  }

  function renderAlbum(album: Album, index: number): ReactElement {
    // #TODO investigate render issue
    if (!album) {
      return null;
    }
    switch (albumView) {
      case UIAlbumView.Extended:
        return (
          <li key={album._id}>
            <AlbumView
              isCurrent={album._id === currentAlbumId}
              currentTrackId={currentTrackId}
              playlistId={playlist._id}
              album={album}
              onContextMenu={onAlbumContextMenu}/>
          </li>
        );
      case UIAlbumView.Compact:
        return (
          <li key={album._id}>
            <CompactAlbumView
              playlistId={playlist._id}
              album={album}
              index={index}
              isCurrent={album._id === currentAlbumId}
              onDragEnd={onDragEnd}
              onAlbumMove={onAlbumMove}
              onContextMenu={onAlbumContextMenu}/>
          </li>
        );
    }
  }

  function renderActionButtons(): ReactElement {
    return (
      <span className="playlist-view-actions">
        <button
          className={cx('playlist-view-action-button', { 'is-current': albumView === UIAlbumView.Extended })}
          onClick={(): void => setAlbumView(UIAlbumView.Extended)}>
          <FontAwesomeIcon icon="list-alt" className="playlist-icon" fixedWidth/>
        </button>
        <button
          className={cx('playlist-view-action-button', { 'is-current': albumView === UIAlbumView.Compact })}
          onClick={(): void => setAlbumView(UIAlbumView.Compact)}>
          <FontAwesomeIcon icon="th-list" className="playlist-icon" fixedWidth/>
        </button>
      </span>
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
            { renderActionButtons() }
        </div>
        <p className="playlist-info header-like">Created on {date}</p>
      </header>
      {
        hasAlbums
          ? <ol className="album-list">{albumOrder.map((_id, index) => renderAlbum(albums[_id], index))}</ol>
          : <p className="playlist-empty-placeholder">Playlist is empty.</p>
      }
    </section>
	);
}
