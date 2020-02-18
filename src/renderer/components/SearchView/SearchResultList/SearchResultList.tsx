import React, { ReactElement, memo, useMemo, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTable } from 'react-table';
import { FixedSizeList as List, ListOnItemsRenderedProps, ListChildComponentProps, areEqual } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { useTranslation } from 'react-i18next';
import memoize from 'memoize-one';
import { SearchResultListRow } from './SearchResultListRow/SearchResultListRow';
import { getCoverRequest } from '../../../store/modules/cover';
import { Album } from '../../../store/modules/album';
import './SearchResultList.scss';

type SearchResultListProps = {
  results: Array<Album>;
  query: string;
  isSearching: boolean;
  currentAlbumId?: Album['_id'];
  onResultContextMenu: Function;
  onResultDoubleClick: Function;
};

const ITEM_SIZE = 57;

export const SearchResultList: React.FC<SearchResultListProps> = ({
  results = [],
  query,
  isSearching,
  currentAlbumId,
  onResultContextMenu,
  onResultDoubleClick
}) => {
  const [renderedItems, setRenderedItems] = useState([]);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const columns = useMemo(() => [
    {
      Header: '',
      id: 'cover'
    },
    ...['artist', 'title', 'year', 'type'].map(x => ({
      Header: t(`albums.props.${x}`),
      accessor: x
    }))
 ],[]);

 useEffect(() => {
   setRenderedItems([]);
 }, [results, query])

  const {
    getTableProps,
    getTableBodyProps,
    headers,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data: results,
  });

  const Row = memo(({ data, index, style }: ListChildComponentProps) => {
    const {
      rows,
      currentAlbumId,
      onResultContextMenu,
      onResultDoubleClick,
      prepareRow
    } = data;
    const row = rows[index];
    prepareRow(row);
    return <SearchResultListRow
      style={{
        ...style,
        left: `var(--section-gutter)`,
        width: `calc(100% - 2 * var(--section-gutter))`
      }}
      key={row.original._id}
      row={row}
      album={row.original}
      isCurrent={row.original._id === currentAlbumId}
      onContextMenu={onResultContextMenu}
      onCoverDoubleClick={onResultDoubleClick}/>;
  }, areEqual);

  function renderEmptyComponent(query: string): ReactElement {
    return (
      <p className="search-result-list-empty-component">
        {t('search.empty')} <span className='highlight'>{query}</span>.
      </p>
    );
  }

  function onItemsRendered({
    visibleStartIndex,
    visibleStopIndex
  }: ListOnItemsRenderedProps): void {
    for (let i = visibleStartIndex; i < visibleStopIndex; i++) {
      if (renderedItems.indexOf(i) > -1) {
        continue;
      }
      renderedItems.push(i);
      dispatch(getCoverRequest(results[i]));
    }
  }

  const createItemData = memoize((
    rows,
    currentAlbumId,
    onResultContextMenu,
    onResultDoubleClick,
    prepareRow
  ) => ({
    rows,
    currentAlbumId,
    onResultContextMenu,
    onResultDoubleClick,
    prepareRow
  }));

  function renderResults(): ReactElement {
    const itemData = createItemData(
      rows,
      currentAlbumId,
      onResultContextMenu,
      onResultDoubleClick,
      prepareRow
    );
    return (
      <div {...getTableProps()} className="search-result-list">
        <div className="thead search-result-list-header">
          <div className="tr">
          {headers.map(column => (
            <div {...column.getHeaderProps()} className={`th header header-${column.id}`}>
              {column.render('Header')}
            </div>
          ))}
          </div>
        </div>
        <div {...getTableBodyProps()} className="tbody">
          <AutoSizer>
          {({ height, width }): ReactElement => {
            return (
              <List
                itemData={itemData}
                itemCount={results.length}
                itemSize={ITEM_SIZE}
                onItemsRendered={onItemsRendered}
                height={height}
                width={width}>
                {Row}
              </List>
            )}}
          </AutoSizer>
        </div>
      </div>
    );
  }

  if (isSearching || query === '') {
    return null;
  }

  return (
    results.length === 0
      ? renderEmptyComponent(query)
      : renderResults()
	);
}
