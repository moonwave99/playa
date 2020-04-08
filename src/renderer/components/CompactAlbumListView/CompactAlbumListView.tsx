import React, { ReactElement, FC, useEffect } from 'react';
import { CompactAlbumView } from './CompactAlbumView/CompactAlbumView';
import { Album } from '../../store/modules/album';
import { Artist } from '../../store/modules/artist';
import { Track } from '../../store/modules/track';
import useGrid from '../../hooks/useGrid/useGrid';
import scrollTo from '../../lib/scrollTo';

import './CompactAlbumListView.scss';

type CompactAlbumListViewProps = {
  albums: Album[];
  currentAlbumId: Album['_id'];
  onSelectionChange: Function;
  onAlbumMove?: Function;
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
    onItemClick,
    requestFocus,
    selectItem
  } = useGrid({
    items: albums,
    direction: 'vertical',
    clearSelectionOnBlur: false,
    onEnter,
    onBackspace
  });

  useEffect(() => {
    onSelectionChange && onSelectionChange(selection);
    if (selection.length === 1) {
      scrollTo({
        selector: `#album-${selection[0]}`,
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selection]);

  useEffect(() => {
    requestFocus();
  }, []);

  useEffect(() => {
    if (!albums.length) {
      return;
    }
    selectItem(albums[0]._id);
  }, [albums.length]);

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
        selectedIDs={selection}
        isCurrent={_id === currentAlbumId}
        selected={selection.indexOf(_id) > -1}
        sortable={sortable}
        onClick={onClick}
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
