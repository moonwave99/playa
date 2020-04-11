import { isEqual } from 'lodash';
import React, { ReactElement, MouseEvent, FC, useEffect } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import TooltipTrigger, { ChildrenArg, TooltipArg } from 'react-popper-tooltip';
import { usePrevious } from 'react-delta';
import { PlaylistGridTileView } from './PlaylistGridTileView/PlaylistGridTileView';
import { TooltipPlaylistView } from '../TooltipPlaylistView/TooltipPlaylistView';
import { Playlist } from '../../store/modules/playlist';
import { PLAYLIST_SHOW } from '../../routes';

import useGrid, { EMPTY_CELL } from '../../hooks/useGrid/useGrid';
import scrollTo from '../../lib/scrollTo';

import {
  ALBUM_GRID_THRESHOLDS,
  ALBUM_GRID_TOOLTIP_DELAY_SHOW,
  ALBUM_GRID_TOOLTIP_DELAY_HIDE
} from '../../../constants';

import './PlaylistGridView.scss';

type PlaylistGridViewProps = {
  playlists: Playlist[];
  currentPlaylistId: Playlist['_id'];
  onPlaylistDelete: Function;
  onPlaylistContextMenu: Function;
  onSelectionChange: Function;
};

export const PlaylistGridView: FC<PlaylistGridViewProps> = ({
  playlists = [],
  currentPlaylistId,
  onPlaylistDelete,
  onPlaylistContextMenu,
  onSelectionChange
}) => {
  const history = useHistory();

  function onEnter(selectedIndexes: Playlist['_id'][]): void {
		if (selectedIndexes.length !== 1) {
			return;
		}
		const { _id } = playlists.find(({ _id }) => _id === selectedIndexes[0]);
    history.push(generatePath(PLAYLIST_SHOW, { _id }));
	}

  function onBackspace(selectedIndexes: Playlist['_id'][]): void {
    if (!selectedIndexes.length) {
      return;
    }
    onPlaylistDelete(
      selectedIndexes.map(index => playlists.find(({ _id }) => _id === index))
    );
  }

  const {
    grid,
    rows,
    selection,
    threshold,
    onItemClick,
    requestFocus
  } = useGrid({
    items: playlists,
    thresholds: ALBUM_GRID_THRESHOLDS,
    initialSelection: [playlists[0]._id],
    excludeClass: '.playlist-cover',
    clearSelectionOnBlur: true,
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
        selector: `#playlist-grid-tile-${selection[0]}`,
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selection, previousSelection]);

  useEffect(() => {
    requestFocus();
  }, []);

  function renderTile(playlist: Playlist): ReactElement {
    if (!playlist) {
      return;
    }
    const { _id } = playlist;

    if (_id === EMPTY_CELL) {
      return (null);
    }

    function renderTooltip(tooltipArgs: TooltipArg): ReactElement {
      return (
        <TooltipPlaylistView
          playlist={playlist} {...tooltipArgs}/>
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

      function onClick({
        event
      }: {
        event: MouseEvent;
      }): void {
        onItemClick({
          _id,
          ...event
        });
      }

      return (
        <PlaylistGridTileView
          style={{ width: `${(100 / threshold.columns)}%` }}
          playlist={playlist}
          selected={selection.indexOf(_id) > -1}
          isPlaying={_id === currentPlaylistId}
          selectedIDs={selection}
          onClick={onClick}
          onContextMenu={onPlaylistContextMenu}
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

  function renderRow(row: Playlist[], rowIndex: number): ReactElement {
    return (
      <div
        className="playlist-grid-row"
        key={rowIndex}>{row.map(renderTile)}
      </div>
    );
  }

  return (
    <div className="playlist-grid" data-key-catch="useGrid" ref={grid}>
      {rows.map(renderRow)}
    </div>
  );
}
