import React, { ReactElement, FC, useState, useEffect } from 'react';
import { AlbumView } from './AlbumView/AlbumView';
import { Album } from '../../store/modules/album';
import { Artist } from '../../store/modules/artist';
import { Track } from '../../store/modules/track';
import { EntityHashMap } from '../../utils/storeUtils';

import './AlbumListView.scss';

type AlbumListViewProps = {
  albums: EntityHashMap<Album>;
  originalOrder: string[];
  currentAlbumId: Album['_id'];
  currentTrackId: Track['_id'];
  dragType: string;
  onAlbumOrderChange?: Function;
  onAlbumContextMenu: Function;
  onAlbumDoubleClick: Function;
};

export const AlbumListView: FC<AlbumListViewProps> = ({
  albums,
  originalOrder,
  currentAlbumId,
  currentTrackId,
  dragType,
  onAlbumContextMenu,
  onAlbumDoubleClick
}) => {
  const [albumOrder, setAlbumOrder] = useState(originalOrder);

  useEffect(
    () => setAlbumOrder(originalOrder)
    , [originalOrder]
  );

  function renderAlbum(album: Album): ReactElement {
    if (!album) {
      return null;
    }
    function onDoubleClick(album: Album, artist: Artist, track: Track): void {
      onAlbumDoubleClick(album, artist, track);
    }
    return (
      <li key={`${album._id}`}>
        <AlbumView
          isCurrent={album._id === currentAlbumId}
          currentTrackId={currentTrackId}
          dragType={dragType}
          album={album}
          onContextMenu={onAlbumContextMenu}
          onDoubleClick={onDoubleClick}/>
      </li>
    );
  }

	return (
    <ol className="album-list">
      {albumOrder.map(_id => renderAlbum(albums[_id]))}
    </ol>
	);
}
