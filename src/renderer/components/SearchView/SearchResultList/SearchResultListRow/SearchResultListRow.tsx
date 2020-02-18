import React, { ReactElement, SyntheticEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Cell } from 'react-table';
import { useDrag } from 'react-dnd';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CoverView } from '../../../AlbumListView/AlbumView/CoverView/CoverView';
import { UIDragTypes } from '../../../../store/modules/ui';
import { Album, VARIOUS_ARTISTS_ID } from '../../../../store/modules/album';
import { searchRequest } from '../../../../store/modules/search';
import { selectors as coverSelectors } from '../../../../store/modules/cover';
import { ApplicationState } from '../../../../store/store';

type SearchResultListRowProps = {
  row: Row;
  album: Album;
  isCurrent?: boolean;
  onContextMenu: Function;
  onCoverDoubleClick: Function;
  style: object;
}

export const SearchResultListRow: React.FC<SearchResultListRowProps> = ({
  row,
  album,
  isCurrent = false,
  onContextMenu,
  onCoverDoubleClick,
  style
}) => {
  const dispatch = useDispatch();
  const { _id } = album;
  const cover = useSelector((state: ApplicationState) => coverSelectors.findById(state, _id));
  const [{ opacity }, drag] = useDrag({
    item: {
      type: UIDragTypes.SEARCH_RESULTS,
      _id
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    })
  });

  function _onConTextMenu(): void {
    onContextMenu(album);
  }

  function _onCoverDoubleClick(): void {
    onCoverDoubleClick(album);
  }

  function onArtistClick(event: SyntheticEvent): void {
    event.preventDefault();
    dispatch(searchRequest(`artist: ${album.artist}`));
  }

  function renderCell(cell: Cell): ReactElement {
    let cellContent = null;
    switch (cell.column.id) {
      case 'cover':
        cellContent =
          <div ref={drag}>
            <CoverView
              onDoubleClick={_onCoverDoubleClick}
              album={album}
              src={cover}/>
          </div>;
        break;
      case 'artist':
        cellContent =
          <a href="#" onClick={onArtistClick} title={cell.value}>
            {cell.value === VARIOUS_ARTISTS_ID ? 'V/A' : cell.value}
          </a>;
        break;
      case 'title':
        cellContent =
          <span className="title" title={cell.value}>
            {cell.value} { isCurrent ? <FontAwesomeIcon icon="volume-up"/> : null }
          </span>;
        break;
      case 'year':
        cellContent = cell.value || '-';
        break;
      case 'type':
        cellContent = <span className={cx('tag', `tag-${cell.value}`)}>{cell.value}</span>;
        break;
      default:
        cellContent = cell.value;
        break;
    }
    return (
      <div {...cell.getCellProps()} className={`td cell cell-${cell.column.id}`}>
        {cellContent}
      </div>
    );
  }
  const classNames = cx('search-result-list-item', 'tr', { 'is-current' : isCurrent });
  return (
    <div {...row.getRowProps()}
      className={classNames}
      style={{ ...style, opacity }}
      onContextMenu={_onConTextMenu}>
      {row.cells.map(renderCell)}
    </div>
  );
}
