import React, { ReactElement, MouseEvent, memo, useMemo, useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTable } from 'react-table';
import { FixedSizeList as List, ListOnItemsRenderedProps, ListChildComponentProps, areEqual } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { useTranslation } from 'react-i18next';
import memoize from 'memoize-one';
import { CustomDragLayer } from '../CustomDragLayer/CustomDragLayer';
import { SearchResultListRow } from './SearchResultListRow/SearchResultListRow';
import { getCoverRequest } from '../../../store/modules/cover';
import { Album } from '../../../store/modules/album';
import { select } from '../../../utils/selectionUtils';
import './SearchResultList.scss';

type SearchResultListProps = {
  results: Array<Album>;
  query: string;
  isSearching: boolean;
  currentAlbumId?: Album['_id'];
  onContextMenu: Function;
  onResultDoubleClick: Function;
};

type SelectionItem = {
  _id: string;
  selected: boolean;
};

const ITEM_SIZE = 57;

function getSelectedIDs(selection: SelectionItem[]): string[] {
  return selection
    .filter(({ selected }) => selected )
    .map(({ _id }) => _id);
}

export const SearchResultList: React.FC<SearchResultListProps> = ({
  results = [],
  query,
  isSearching,
  currentAlbumId,
  onContextMenu,
  onResultDoubleClick
}) => {
  const [renderedItems, setRenderedItems] = useState([]);
  const [selection, setSelection] = useState([]);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const elementRef = useRef(null);
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
   setSelection(
     results.map(({ _id }) => ({ _id, selected: false }))
   );
 }, [results, query]);

 function handleClickOutside(event: Event): void {
   if (elementRef.current && !elementRef.current.contains(event.target)) {
     setSelection(
       results.map(({ _id }) => ({ _id, selected: false }))
     );
   }
 }

 useEffect(() => {
   document.addEventListener("mousedown", handleClickOutside);
   return (): void => document.removeEventListener("mousedown", handleClickOutside);
 }, [handleClickOutside]);

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

  function onResultContextMenu({ _id }: Album): void {
    const selectedIDs = getSelectedIDs(selection);

    if (selectedIDs.indexOf(_id) > -1) {
      onContextMenu(selectedIDs);
    } else {
      onContextMenu([_id]);
    }
  }

  function onResultClick(event: MouseEvent, index: number): void {
    const { metaKey, shiftKey } = event;
    setSelection(
      select({
        items: selection,
        index,
        metaKey,
        shiftKey
      })
    );
  }

  const Row = memo(({ data, index, style }: ListChildComponentProps) => {
    const {
      rows,
      selection,
      currentAlbumId,
      onResultContextMenu,
      onResultDoubleClick,
      prepareRow
    } = data;
    const row = rows[index];
    prepareRow(row);
    const { _id } = row.original;
    const selectedIDs = getSelectedIDs(selection);
    return <SearchResultListRow
      style={{
        ...style,
        left: `var(--section-gutter)`,
        width: `calc(100% - 2 * var(--section-gutter))`
      }}
      selected={selection[index].selected}
      key={_id}
      row={row}
      index={index}
      album={row.original}
      isCurrent={_id === currentAlbumId}
      selectedIDs={selectedIDs}
      onClick={onResultClick}
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
    selection,
    currentAlbumId,
    onResultContextMenu,
    onResultDoubleClick,
    prepareRow
  ) => ({
    rows,
    selection,
    currentAlbumId,
    onResultContextMenu,
    onResultDoubleClick,
    prepareRow
  }));

  function renderResults(): ReactElement {
    const itemData = createItemData(
      rows,
      selection,
      currentAlbumId,
      onResultContextMenu,
      onResultDoubleClick,
      prepareRow
    );
    return (
      <>
        <CustomDragLayer/>
        <div {...getTableProps()} className="search-result-list" ref={elementRef}>
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
      </>
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
