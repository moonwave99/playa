import React, { FC, ReactElement, MouseEvent, useState, useEffect } from 'react';
import TooltipTrigger, { ChildrenArg, TooltipArg } from 'react-popper-tooltip';
import { AlbumGridTileView } from './AlbumGridTileView/AlbumGridTileView';
import { TooltipAlbumView } from '../../TooltipAlbumView/TooltipAlbumView';
import { Album } from '../../../store/modules/album';
import useGrid from '../../../hooks/useGrid/useGrid';
import scrollTo from '../../../lib/scrollTo';

import './AlbumGridView.scss';

import { ALBUM_GRID_THRESHOLDS, ALBUM_GRID_TOOLTIP_DELAY } from '../../../../constants';

type AlbumGridViewProps = {
  albums: Album[];
  currentAlbumId?: Album['_id'];
  showArtists?: boolean;
  autoFocus?: boolean;
  clearSelectionOnBlur?: boolean;
  onSelectionChange?: Function;
  onEnter?: Function;
  onBackspace?: Function;
  onAlbumContextMenu?: Function;
  onAlbumDoubleClick?: Function;
};

export const AlbumGridView: FC<AlbumGridViewProps> = ({
  albums = [],
  currentAlbumId,
  clearSelectionOnBlur = false,
  showArtists = true,
  autoFocus = false,
  onSelectionChange,
  onEnter,
  onBackspace,
  onAlbumContextMenu,
  onAlbumDoubleClick
}) => {
  const [isDragging, setDragging] = useState(false);

  const {
    grid,
    rows,
    selection,
    threshold,
    onItemClick,
    requestFocus,
    selectItem
  } = useGrid({
    items: albums,
    thresholds: ALBUM_GRID_THRESHOLDS,
    excludeClass: '.album-cover',
    clearSelectionOnBlur,
    onEnter,
    onBackspace
  });

  useEffect(() => {
    onSelectionChange && onSelectionChange(selection);
    if (selection.length === 1) {
      scrollTo({
        selector: `#album-grid-tile-${selection[0]}`,
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selection]);

  useEffect(() => {
    if (autoFocus) {
      requestFocus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!albums.length || !autoFocus) {
      return;
    }
    selectItem(albums[0]._id);
  }, [albums]);

  function onDragBegin(): void {
    setDragging(true);
  }

  function onDragEnd(): void {
    setDragging(false);
  }

  function renderTile(album: Album): ReactElement {
    if (!album) {
      return;
    }
    const { _id } = album;

    function renderTooltip(tooltipArgs: TooltipArg): ReactElement {
      return (
        <TooltipAlbumView
          onDoubleClick={onAlbumDoubleClick}
          album={album} {...tooltipArgs}/>
      );
    }

    function renderTrigger({
      getTriggerProps,
      triggerRef: ref
    }: ChildrenArg): ReactElement {
      const {
        onMouseEnter,
        onMouseLeave,
      } = getTriggerProps({ ref });

      function onClick(event: MouseEvent, { _id }: Album): void {
        onItemClick({
          _id,
          ...event
        });
      }

      return (
        <AlbumGridTileView
          style={{ width: `${(100 / threshold.columns)}%` }}
          showArtist={showArtists}
          album={album}
          selected={selection.indexOf(_id) > -1}
          selectedIDs={selection}
          isPlaying={_id === currentAlbumId}
          isDragging={isDragging}
          onClick={onClick}
          onDoubleClick={onAlbumDoubleClick}
          onContextMenu={onAlbumContextMenu}
          onDragBegin={onDragBegin}
          onDragEnd={onDragEnd}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          tooltipTriggerRef={ref}/>
      );
    }

    return (
      <TooltipTrigger
        key={_id}
        placement="bottom"
        trigger="hover"
        delayShow={ALBUM_GRID_TOOLTIP_DELAY}
        tooltip={renderTooltip}>
        {renderTrigger}
      </TooltipTrigger>
    );
  }

	return (
    <div className="album-grid" data-key-catch="useGrid" ref={grid}>
      {rows.map((row, index) =>
        <div
          className="album-grid-row"
          key={index}>{row.map(renderTile)}
        </div>
      )}
    </div>
	);
}
