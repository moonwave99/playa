import React, { ReactElement, FC, useEffect } from 'react';
import { CompactAlbumView } from './CompactAlbumView/CompactAlbumView';
import { Album } from '../../store/modules/album';
import { Artist } from '../../store/modules/artist';
import { Track } from '../../store/modules/track';
import useGrid from '../../hooks/useGrid/useGrid';

import './CompactAlbumListView.scss';

type CompactAlbumListViewProps = {
  albums: Album[];
  currentAlbumId: Album['_id'];
  onSelectionChange: Function;
  onAlbumMove?: Function;
  onDragEnd?: Function;
  onEnter?: Function;
  onBackspace?: Function;
  onAlbumContextMenu: Function;
  onAlbumDoubleClick: Function;
  sortable?: boolean;
};

export const CompactAlbumListView: FC<CompactAlbumListViewProps> = ({
  albums,
  currentAlbumId,
  onSelectionChange,
  onAlbumMove,
  onDragEnd,
  onEnter,
  onBackspace,
  onAlbumContextMenu,
  onAlbumDoubleClick,
  sortable = false
}) => {
  const {
    grid,
    rows,
    selection,
    onItemClick
  } = useGrid({
    items: albums,
    initialSelection: [albums[0] && albums[0]._id],
    direction: 'vertical',
    clearSelectionOnBlur: false,
    onEnter,
    onBackspace
  });

  useEffect(() => {
    onSelectionChange && onSelectionChange(selection);
  }, [selection]);

  function renderAlbum(album: Album, index: number): ReactElement {
    if (!album) {
      return;
    }
    function onClick(event: MouseEvent, { _id }: Album): void {
      onItemClick({
        _id,
        ...event
      });
    }
    function onDoubleClick(album: Album, artist: Artist, track: Track): void {
      onAlbumDoubleClick(album, artist, track);
    }
    const { _id } = album;
    return (
      <CompactAlbumView
        key={_id}
        album={album}
        index={index}
        isCurrent={_id === currentAlbumId}
        selected={selection.indexOf(_id) > -1}
        sortable={sortable}
        onClick={onClick}
        onDragEnd={onDragEnd}
        onAlbumMove={onAlbumMove}
        onContextMenu={onAlbumContextMenu}
        onDoubleClick={onDoubleClick}/>
    );
  }

	return (
    <ol className="compact-album-list" ref={grid}>
      {rows.map((row, index) => (
        <li key={index}>
          {row.map((album) => renderAlbum(album as Album, index))}
        </li>
      ))}
    </ol>
	);
}
