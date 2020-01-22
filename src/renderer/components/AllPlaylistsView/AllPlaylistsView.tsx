import React, { ReactElement, SyntheticEvent, FC, useMemo } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTable, Cell } from 'react-table';
import { Playlist } from '../../store/modules/playlist';
import { formatDate } from '../../utils/datetimeUtils';
import { PLAYLIST_SHOW } from '../../routes';
import './AllPlaylistsView.scss';

type AllPlaylistsViewProps = {
  playlists: Playlist[];
  onPlaylistDelete: Function;
};

export const AllPlaylistsView: FC<AllPlaylistsViewProps> = ({
  playlists = [],
  onPlaylistDelete
}) => {
  const { t } = useTranslation();
  const columns = useMemo(() => [
   ...['title', 'created', 'accessed'].map(x => ({
     Header: t(`playlists.props.${x}`),
     accessor: x
   })),
   {
     Header: '',
     id: 'delete',
     accessor: '_id'
   }
 ],[]);

  const {
    getTableProps,
    getTableBodyProps,
    headers,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data: playlists,
  });

  function renderCell(cell: Cell): ReactElement {
    const playlist = cell.row.original as Playlist;
    const { _id } = playlist;
    let cellContent = null;
    function onDeleteButtonClick(event: SyntheticEvent): void {
      event.preventDefault();
      onPlaylistDelete(cell.row.original);
    }
    switch (cell.column.id) {
      case 'title':
        cellContent =
          <Link
            title={_id}
            to={generatePath(PLAYLIST_SHOW, { _id })}>
            {cell.value}
          </Link>
        break;
      case 'accessed':
      case 'created':
        cellContent = formatDate({ date: cell.value });
        break;
      case 'delete':
        cellContent = <a href="#" onClick={onDeleteButtonClick}>{t('playlists.actions.delete')}</a>;
        break;
      default:
        cellContent = cell.value;
        break;
    }
    return (
      <td {...cell.getCellProps()} className={`cell cell-${cell.column.id}`}>
        {cellContent}
      </td>
    );
  }

  return (
		<div className="all-playlists-view">
      <h1>{t('playlists.title')}</h1>
      <table {...getTableProps()} className="all-playlists-table">
        <thead>
          <tr>
          {headers.map(column => (
            <th {...column.getHeaderProps()} className={`header header-${column.id}`}>{column.render('Header')}</th>
          ))}
          </tr>
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(
            row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(renderCell)}
                </tr>
              )}
          )}
        </tbody>
      </table>
    </div>
	);
}
