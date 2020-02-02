import React, { ReactElement, useMemo } from 'react';
import { useTable } from 'react-table';
import { useTranslation } from 'react-i18next';
import { SearchResultListRow } from './SearchResultListRow/SearchResultListRow';
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

export const SearchResultList: React.FC<SearchResultListProps> = ({
  results,
  query,
  isSearching,
  currentAlbumId,
  onResultContextMenu,
  onResultDoubleClick
}) => {
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

  function renderEmptyComponent(query: string): ReactElement {
    return (
      <p className="search-result-list-empty-component">
        {t('search.empty')} <span className='highlight'>{query}</span>.
      </p>
    );
  }

  if (isSearching || query === '') {
    return null;
  }

  return (
    results.length === 0 ? renderEmptyComponent(query) :
      <table {...getTableProps()} className="search-result-list">
        <thead className="search-result-list-header">
          <tr>
          {headers.map(column => (
            <th {...column.getHeaderProps()} className={`header header-${column.id}`}>
              {column.render('Header')}
            </th>
          ))}
          </tr>
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return <SearchResultListRow
              key={row.original._id}
              row={row}
              album={row.original}
              isCurrent={row.original._id === currentAlbumId}
              onContextMenu={onResultContextMenu}
              onCoverDoubleClick={onResultDoubleClick}/>
          })}
        </tbody>
      </table>
	);
}
