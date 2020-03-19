import React, { ReactElement, MouseEvent, memo, useMemo, useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTable, Row } from 'react-table';
import { FixedSizeList as List, ListOnItemsRenderedProps, ListChildComponentProps, areEqual } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { useTranslation } from 'react-i18next';
import memoize from 'memoize-one';
import useSelect, { SelectionItem } from '../../../hooks/useSelect/useSelect';
import { CustomDragLayer } from '../CustomDragLayer/CustomDragLayer';
import { SearchResultListRow } from './SearchResultListRow/SearchResultListRow';
import { getCoverRequest } from '../../../store/modules/cover';
import { Album } from '../../../store/modules/album';
import { Artist } from '../../../store/modules/artist';
import { selectionBounds } from '../../../utils/selectionUtils';
import './SearchResultList.scss';

type SearchResultListProps = {
	results: Array<Album>;
	query: string;
	isSearching: boolean;
	currentAlbumId?: Album['_id'];
	onContextMenu: Function;
	onResultDoubleClick: Function;
	onResultEnter: Function;
};

const ITEM_SIZE = 57;

function getSelectedIDs(
	items: { _id: string }[],
	selection: SelectionItem[]
): string[] {
	return selection
		.filter(({ selected }) => selected)
		.map(({ index }) => items[index]._id);
}

export const SearchResultList: React.FC<SearchResultListProps> = ({
	results = [],
	query,
	isSearching,
	currentAlbumId,
	onContextMenu,
	onResultDoubleClick,
	onResultEnter
}) => {

	function _onResultEnter(selectedIndexes: number[]): void {
		if (selectedIndexes.length !== 1) {
			return;
		}
		onResultEnter(results[selectedIndexes[0]]);
	}

	const [renderedItems, setRenderedItems] = useState([]);
	const { selection, direction, onItemClick } = useSelect({
		items: results,
		onEnter: _onResultEnter
	});
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const elementRef = useRef(null);
	const listRef = useRef<List>(null);
	const columns = useMemo(() => [
		{
			Header: '',
			id: 'cover'
		},
		...['artist', 'title', 'year', 'type'].map(x => ({
			Header: t(`albums.props.${x}`),
			accessor: x
		}))
	], []);

	useEffect(() => {
		setRenderedItems([]);
	}, [results, query]);

	useEffect(() => {
		if (!listRef.current) {
			return;
		}
		const [lowerBound, upperBound] = selectionBounds(selection);
		listRef.current.scrollToItem(direction === 1 ? upperBound : lowerBound);
	}, [selection, direction]);

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

	function onResultContextMenu({ _id }: Album, artist: Artist): void {
		const selectedIDs = getSelectedIDs(results, selection);
		if (selectedIDs.indexOf(_id) > -1) {
			onContextMenu(selectedIDs);
		} else {
			onContextMenu([_id], artist);
		}
	}

	function onResultClick(event: MouseEvent, index: number): void {
		onItemClick({
			index,
			...event
		});
	}

	const ResultRow = memo(({
		style,
		index,
		row,
		selectedIDs,
		selection,
		onResultClick,
		onResultDoubleClick,
		onResultContextMenu
	}: {
			style: object;
			index: number;
			row: Row;
			selectedIDs: string[];
			selection: SelectionItem[];
			currentAlbumId: string;
			onResultClick: Function;
			onResultDoubleClick: Function;
			onResultContextMenu: Function;
		}) => {
		const album = row.original as Album;
		const { _id } = album;
		return (
			<SearchResultListRow
				style={{
					...style,
					left: `var(--section-gutter)`,
					width: `calc(100% - 2 * var(--section-gutter))`
				}}
				selected={selection[index] && selection[index].selected}
				key={_id}
				row={row}
				index={index}
				album={album}
				onClick={onResultClick}
				onContextMenu={onResultContextMenu}
				onCoverDoubleClick={onResultDoubleClick}
				isCurrent={_id === currentAlbumId}
				selectedIDs={selectedIDs} />
		);
	});

	const GenerateRow = memo(({ data, index, style }: ListChildComponentProps) => {
		const {
			rows,
			selection,
			currentAlbumId,
			onResultClick,
			onResultContextMenu,
			onResultDoubleClick,
			prepareRow
		} = data;
		const row = rows[index];
		prepareRow(row);
		const selectedIDs = getSelectedIDs(results, selection);
		return (
			<ResultRow
				style={style}
				index={index}
				row={row}
				selection={selection}
				onResultClick={onResultClick}
				onResultContextMenu={onResultContextMenu}
				onResultDoubleClick={onResultDoubleClick}
				currentAlbumId={currentAlbumId}
				selectedIDs={selectedIDs} />
		);
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
		onResultClick,
		onResultContextMenu,
		onResultDoubleClick,
		prepareRow
	) => ({
		rows,
		selection,
		currentAlbumId,
		onResultClick,
		onResultContextMenu,
		onResultDoubleClick,
		prepareRow
	}));

	function renderResults(): ReactElement {
		const itemData = createItemData(
			rows,
			selection,
			currentAlbumId,
			onResultClick,
			onResultContextMenu,
			onResultDoubleClick,
			prepareRow
		);
		return (
			<>
				<CustomDragLayer />
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
										ref={listRef}
										itemData={itemData}
										itemCount={results.length}
										itemSize={ITEM_SIZE}
										onItemsRendered={onItemsRendered}
										height={height}
										width={width}>
										{GenerateRow}
									</List>
								)
							}}
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
