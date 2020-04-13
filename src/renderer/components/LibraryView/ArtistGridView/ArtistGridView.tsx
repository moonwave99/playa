import React, { FC, ReactElement, memo, useEffect, useRef } from 'react';
import {
  FixedSizeList as List,
  ListChildComponentProps,
  areEqual
} from 'react-window';
import memoize from 'memoize-one';
import AutoSizer from "react-virtualized-auto-sizer";
import { ArtistGridTileView } from './ArtistGridTileView/ArtistGridTileView';
import useGrid, { EMPTY_CELL } from '../../../hooks/useGrid/useGrid';

import './ArtistGridView.scss';

import { Artist } from '../../../store/modules/artist';
import { ARTIST_GRID_THRESHOLDS } from '../../../../constants';

const ITEM_SIZE_RATIO = 1.2;

type ArtistGridViewProps = {
  artists: Artist[];
  onContextMenu: Function;
}

export const ArtistGridView: FC<ArtistGridViewProps> = ({
  artists,
  onContextMenu
}) => {
  const ref = useRef(null);

  const {
    rows,
    threshold
  } = useGrid({
    items: artists,
    thresholds: ARTIST_GRID_THRESHOLDS,
    interactive: false
  });

  const createItemData = memoize((
    rows,
    onContextMenu
	) => ({
    rows,
    onContextMenu
	}));

  const itemData = createItemData(
    rows,
    onContextMenu
  );

  useEffect(() => {
    if (!artists.length || !ref.current) {
      return;
    }
    ref.current.scrollToItem(0);
  }, [artists]);

  const GenerateRow = memo(({ data, index, style }: ListChildComponentProps) => {
    const { rows, onContextMenu } = data;
    const row = rows[index] as Artist[];
    if (!row) {
      return null;
    }
    const rowId = row.map(({ _id }) => _id).join('-');
    return (
      <div key={rowId} className="artist-grid-row" style={style}>
        {row.map((artist: Artist) => artist._id === EMPTY_CELL ? null : (
          <div key={artist._id} className="artist-list-tile" style={{ width: `${(100 / row.length)}%`}}>
            <ArtistGridTileView
              artist={artist}
              onContextMenu={onContextMenu}/>
          </div>
        ))}
      </div>
    );
  }, areEqual);

  function getItemHeight(containerWidth: number): number {
    return containerWidth / threshold.columns * ITEM_SIZE_RATIO;
  }

  return (
    <section className="artist-grid-wrapper">
      <AutoSizer defaultWidth={960} defaultHeight={960}>
        {({ height, width }): ReactElement => (
          <List
            ref={ref}
            className="artist-grid"
            itemData={itemData}
            itemCount={rows.length}
            itemSize={getItemHeight(width)}
            height={height}
            width={width}>
            {GenerateRow}
          </List>
        )}
      </AutoSizer>
    </section>
  );
}
