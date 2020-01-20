import React, { ReactElement, SyntheticEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Cell } from 'react-table';
import { useDrag } from 'react-dnd';
import cx from 'classnames';
import { CoverView } from '../../../AlbumListView/AlbumView/CoverView/CoverView';
import { ApplicationState } from '../../../../store/store';
import { UIDragTypes } from '../../../../store/modules/ui';
import { Album, VARIOUS_ARTISTS_ID } from '../../../../store/modules/album';
import { searchRequest } from '../../../../store/modules/search';
import { getCoverRequest } from '../../../../store/modules/cover';

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
  const dispatch = useDispatch();
  const { _id } = album;
  const cover = useSelector(({ covers }: ApplicationState) => covers.allById[_id]);

  useEffect(() => {
    dispatch(getCoverRequest(album));
  }, []);

  const [{ opacity }, drag] = useDrag({
    item: {
      type: UIDragTypes.SEARCH_RESULTS,
      _id
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    })
  });  

  function onConTextMenu(): void {
    onResultContextMenu(album);
  }

  function onDoubleClick(): void {
    onResultDoubleClick(album);
  }

  function onArtistClick(event: SyntheticEvent): void {
    event.preventDefault();
    dispatch(searchRequest(album.artist));
  }

  function renderCell(cell: Cell): ReactElement {
    let cellContent = null;
    switch (cell.column.id) {
      case 'cover':
        cellContent =
          <div ref={drag}>
            <CoverView
              onDoubleClick={onDoubleClick}
              album={album}
              src={cover}/>
          </div>;
        break;
      case 'type':
        cellContent = <span className={cx('tag', `tag-${cell.value}`)}>{cell.value}</span>;
        break;
      case 'artist':
        cellContent =
          <a href="#" onClick={onArtistClick}>
            {cell.value === VARIOUS_ARTISTS_ID ? 'V/A' : cell.value}
          </a>;
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

  return (
    <tr {...row.getRowProps()}
      className="search-result-list-item"
      style={{ opacity }}
      onContextMenu={onConTextMenu}>
      {row.cells.map(renderCell)}
    </tr>
  );
}
