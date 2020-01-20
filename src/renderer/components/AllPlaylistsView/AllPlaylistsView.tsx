import React, { ReactElement, SyntheticEvent, FC, useMemo } from 'react';
import { Link, generatePath } from 'react-router-dom';
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

  const columns = useMemo(() => [{
     Header: 'Title',
     accessor: 'title'
   },
   {
     Header: 'Created on',
     accessor: 'created'
   },
   {
     Header: 'Last accessed',
     accessor: 'accessed'
   },
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
        cellContent = <a href="#" onClick={onDeleteButtonClick}>Delete</a>;
        break;
      default:
        cellContent = cell.value;
        break;
    }
    return <td {...cell.getCellProps()}>{cellContent}</td>;
  }

  return (
		<div className="all-playlists-view">
      <h1>playlist://<span className="highlight">all</span></h1>
      <table {...getTableProps()} className="all-playlists-table">
        <thead>
          <tr>
          {headers.map(column => (
            <th {...column.getHeaderProps()}>{column.render('Header')}</th>
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
