import React, { ReactElement } from 'react';
import { Row, Cell } from 'react-table';
import { useDrag } from 'react-dnd';
import cx from 'classnames';
import { UIDragTypes } from '../../../../store/modules/ui';
import { Album, VARIOUS_ARTISTS_ID } from '../../../../store/modules/album';

type SearchResultListRowProps = {
  row: Row;
  album: Album;
  onResultContextMenu: Function;
  onResultDoubleClick: Function;
}

export const SearchResultListRow: React.FC<SearchResultListRowProps> = ({
  row,
  album,
  onResultContextMenu,
  onResultDoubleClick
}) => {
  function onConTextMenu(): void {
    onResultContextMenu(album);
  }

  function onDoubleClick(): void {
    onResultDoubleClick(album);
  }

  function renderCell(cell: Cell): ReactElement {
    let cellContent = null;
    switch (cell.column.id) {
      case 'type':
        cellContent = <span className={cx('tag', `tag-${cell.value}`)}>{cell.value}</span>;
        break;
      case 'artist':
        cellContent = cell.value === VARIOUS_ARTISTS_ID ? 'V/A' : cell.value;
        break;
      case 'year':
        cellContent = cell.value || '-';
        break;
      default:
        cellContent = cell.value;
        break;
    }
    return <td {...cell.getCellProps()} className={`cell cell-${cell.column.id}`}>{cellContent}</td>;
  }

  const [{ opacity }, drag] = useDrag({
    item: {
      type: UIDragTypes.SEARCH_RESULTS,
      _id: album._id
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    })
  });
  return (
    <tr {...row.getRowProps()}
      className="search-result-list-item"
      ref={drag}
      style={{ opacity }}
      onContextMenu={onConTextMenu}
      onDoubleClick={onDoubleClick}>
      {row.cells.map(renderCell)}
    </tr>
  );
}
