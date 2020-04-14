import { isEqual } from 'lodash';
import React, { FC, ReactElement, MouseEvent, useState, useEffect } from 'react';
import TooltipTrigger, { ChildrenArg, TooltipArg } from 'react-popper-tooltip';
import { usePrevious } from 'react-delta';
import cx from 'classnames';
import { AlbumGridTileView } from './AlbumGridTileView/AlbumGridTileView';
import { TooltipAlbumView } from '../../TooltipAlbumView/TooltipAlbumView';
import { Album } from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
import useGrid, { EMPTY_CELL } from '../../../hooks/useGrid/useGrid';
import scrollTo from '../../../lib/scrollTo';

import './AlbumGridView.scss';

import {
  ALBUM_GRID_THRESHOLDS,
  ALBUM_GRID_TOOLTIP_DELAY_SHOW,
  ALBUM_GRID_TOOLTIP_DELAY_HIDE
} from '../../../../constants';

type AlbumGridViewProps = {
  albums: Album[];
  currentAlbumId?: Album['_id'];
  currentTrackId?: Track['_id'];
  showArtists?: boolean;
  autoFocus?: boolean;
  interactive?: boolean;
  showTooltips?: boolean;
  clearSelectionOnBlur?: boolean;
  onSelectionChange?: Function;
  groupBy?: string;
  onEnter?: Function;
  onBackspace?: Function;
  onAlbumContextMenu?: Function;
  onAlbumDoubleClick?: Function;
};

export const AlbumGridView: FC<AlbumGridViewProps> = ({
  albums = [],
  currentAlbumId,
  currentTrackId,
  showArtists = true,
  autoFocus = false,
  interactive = true,
  showTooltips = true,
  clearSelectionOnBlur = false,
  groupBy,
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
    setFocus
  } = useGrid({
    items: albums,
    thresholds: ALBUM_GRID_THRESHOLDS,
    initialSelection: interactive ? [albums[0]._id] : [],
    excludeClass: '.album-cover',
    interactive,
    clearSelectionOnBlur,
    groupBy,
    onEnter,
    onBackspace
  });

  const previousSelection = usePrevious(selection);

  useEffect(() => {
    if (isEqual(previousSelection, selection)) {
      return;
    }
    onSelectionChange && onSelectionChange(selection);
    if (selection.length === 1) {
      scrollTo({
        selector: `#album-grid-tile-${selection[0]}`,
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selection, previousSelection]);

  useEffect(() => {
    if (autoFocus) {
      setFocus(true);
    }
  }, []);

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

    if (_id === EMPTY_CELL) {
      return (null);
    }

    function onClick({ event }: {
      event: MouseEvent;
    }): void {
      onItemClick({
        _id,
        ...event
      });
    }

    if (!showTooltips) {
      return (
        <AlbumGridTileView
          key={_id}
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
          onDragEnd={onDragEnd}/>
      );
    }

    function renderTooltip(tooltipArgs: TooltipArg): ReactElement {
      return (
        <TooltipAlbumView
          onDoubleClick={onAlbumDoubleClick}
          currentTrackId={currentTrackId}
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
        delayShow={ALBUM_GRID_TOOLTIP_DELAY_SHOW}
        delayHide={ALBUM_GRID_TOOLTIP_DELAY_HIDE}
        tooltip={renderTooltip}>
        {renderTrigger}
      </TooltipTrigger>
    );
  }

  function renderRow(row: Album[]): ReactElement {
    const classNames = cx('album-grid-row', {
      [`album-grid-row-${row[0].type}`]: !!groupBy
    });
    const rowId = row.map(({ _id }) => _id).join('-');
    return (
      <div
        className={classNames}
        key={rowId}>{row.map(renderTile)}
      </div>
    );
  }

	return (
    <div className="album-grid" data-key-catch="useGrid" ref={grid}>
      {rows.map(renderRow)}
    </div>
	);
}
