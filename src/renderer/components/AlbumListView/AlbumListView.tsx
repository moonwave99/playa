import { ipcRenderer as ipc, Event } from 'electron';
import React, { ReactElement, FC, useState, useEffect, useCallback } from 'react';
import { AlbumView } from './AlbumView/AlbumView';
import { CompactAlbumView } from './CompactAlbumView/CompactAlbumView';
import { Album } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { UIAlbumView } from '../../store/modules/ui';
import { EntityHashMap, immutableMove } from '../../utils/storeUtils';

import { IPC_MESSAGES } from '../../../constants';
const { IPC_UI_TOGGLE_ALBUM_VIEW } = IPC_MESSAGES;

import './AlbumListView.scss';

type AlbumListViewProps = {
  albums: EntityHashMap<Album>;
  originalOrder: string[];
  currentAlbumId: Album['_id'];
  currentTrackId: Track['_id'];
  onAlbumOrderChange?: Function;
  onAlbumContextMenu: Function;
  onAlbumDoubleClick: Function;
  sortable: boolean;
};

export const AlbumListView: FC<AlbumListViewProps> = ({
  albums,
  originalOrder,
  currentAlbumId,
  currentTrackId,
  onAlbumOrderChange,
  onAlbumContextMenu,
  onAlbumDoubleClick,
  sortable = false
}) => {
  const [albumView, setAlbumView] = useState(UIAlbumView.Extended);
  const [albumOrder, setAlbumOrder] = useState(originalOrder);

  useEffect(
    () => setAlbumOrder(originalOrder)
    , [originalOrder]
  );

  useEffect(() => {
    const handler = (_event: Event, _albumView: UIAlbumView): void => setAlbumView(_albumView);
    ipc.on(IPC_UI_TOGGLE_ALBUM_VIEW, handler);
    return (): typeof ipc => ipc.removeListener(IPC_UI_TOGGLE_ALBUM_VIEW, handler);
  }, []);

  const onAlbumMove = useCallback(
    (dragIndex: number, hoverIndex: number): void => setAlbumOrder(immutableMove<Album['_id']>(albumOrder, dragIndex, hoverIndex))
    , [albumOrder]
  );

  function onDragEnd(): void {
    onAlbumOrderChange && onAlbumOrderChange(albumOrder);
  }

  function renderAlbum(album: Album, index: number): ReactElement {
    // #TODO investigate render issue
    if (!album) {
      return null;
    }
    function onDoubleClick(album: Album, track: Track): void {
      onAlbumDoubleClick(album, track);
    }
    switch (albumView) {
      case UIAlbumView.Extended:
        return (
          <li key={album._id}>
            <AlbumView
              isCurrent={album._id === currentAlbumId}
              currentTrackId={currentTrackId}
              album={album}
              onContextMenu={onAlbumContextMenu}
              onDoubleClick={onDoubleClick}/>
          </li>
        );
      case UIAlbumView.Compact:
        return (
          <li key={album._id}>
            <CompactAlbumView
              album={album}
              index={index}
              isCurrent={album._id === currentAlbumId}
              sortable={sortable}
              onDragEnd={onDragEnd}
              onAlbumMove={onAlbumMove}
              onContextMenu={onAlbumContextMenu}
              onDoubleClick={onDoubleClick}/>
          </li>
        );
    }
  }

	return (
    <ol className="album-list">
      {albumOrder.map((_id, index) => renderAlbum(albums[_id], index))}
    </ol>
	);
}
