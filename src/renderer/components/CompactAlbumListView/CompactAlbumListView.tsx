import React, { ReactElement, FC, useEffect, memo } from 'react';
import {
  FixedSizeList as List,
  ListChildComponentProps,
  areEqual
} from 'react-window';
import memoize from 'memoize-one';
import AutoSizer from "react-virtualized-auto-sizer";
import { CompactAlbumView as RawCompactAlbumView } from './CompactAlbumView/CompactAlbumView';
import { Album } from '../../store/modules/album';
import { Artist } from '../../store/modules/artist';
import { Track } from '../../store/modules/track';
import useGrid, { KeyboardDirections } from '../../hooks/useGrid/useGrid';
import scrollTo from '../../lib/scrollTo';

import './CompactAlbumListView.scss';

const CompactAlbumView = memo(RawCompactAlbumView);

const ITEM_SIZE = 64;

export type CompactAlbumListViewProps = {
  albums: Album[];
  currentAlbumId: Album['_id'];
  hasFocus?: boolean;
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
  hasFocus = false,
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
    selection,
    onItemClick,
    setFocus,
    selectItem
  } = useGrid({
    items: albums,
    direction: KeyboardDirections.Vertical,
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
    setFocus(hasFocus);
  }, [hasFocus]);

  useEffect(() => {
    if (!albums.length) {
      return;
    }
    selectItem(albums[0]._id);
  }, [albums.length]);

  function renderAlbum({
    album,
    index,
    selection,
    currentAlbumId,
    onAlbumMove,
    onAlbumContextMenu
  }: {
    album: Album;
    index: number;
    selection: Album['_id'][];
    currentAlbumId: Album['_id'];
    onAlbumMove: Function;
    onAlbumContextMenu: Function;
  }): ReactElement {
    if (!album) {
      return;
    }

    const { _id } = album;

    function onClick(event: MouseEvent, { _id }: Album): void {
      onItemClick({
        _id,
        ...event
      });
    }

    function onDoubleClick(album: Album, artist: Artist, track: Track): void {
      onAlbumDoubleClick(album, artist, track);
    }

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

  const createItemData = memoize((
    albums,
    onAlbumMove,
    onAlbumContextMenu
	) => ({
    albums,
    onAlbumMove,
    onAlbumContextMenu
	}));

  const itemData = createItemData(
    albums,
    onAlbumMove,
    onAlbumContextMenu
  );

  const GenerateRow = memo(({ data, index, style }: ListChildComponentProps) => {
    const {
      albums,
      onAlbumMove,
      onAlbumContextMenu
    } = data;

    const album = albums[index];
    if (!album) {
      return null;
    }
    return (
      <li
        key={album._id}
        style={style}>
        {renderAlbum({
          album,
          index,
          selection,
          currentAlbumId,
          onAlbumMove,
          onAlbumContextMenu
        })}
      </li>
    )
  }, areEqual);

  return (
    <section data-key-catch="useGrid" ref={grid} className="sizer-wrapper">
      <AutoSizer defaultWidth={960} defaultHeight={2 * ITEM_SIZE}>
        {({ height, width }): ReactElement => (
          <List
            className="compact-album-list"
            outerElementType="ol"
            itemData={itemData}
            itemCount={albums.length}
            itemSize={ITEM_SIZE}
            height={height}
            width={width}>
            {GenerateRow}
          </List>
        )}
      </AutoSizer>
    </section>
  );
}
