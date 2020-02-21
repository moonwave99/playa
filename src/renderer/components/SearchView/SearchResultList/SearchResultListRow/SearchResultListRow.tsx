import React, { ReactElement, MouseEvent, SyntheticEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Cell } from 'react-table';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
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
  index: number;
  album: Album;
  selected?: boolean;
  isCurrent?: boolean;
  onClick: Function;
  onContextMenu: Function;
  onCoverDoubleClick: Function;
  selectedIDs?: string[];
  style: object;
}

export const SearchResultListRow: React.FC<SearchResultListRowProps> = ({
  row,
  index,
  album,
  selected = false,
  isCurrent = false,
  onClick,
  onContextMenu,
  onCoverDoubleClick,
  selectedIDs = [],
  style
}) => {
  const dispatch = useDispatch();
  const { _id } = album;
  const cover = useSelector((state: ApplicationState) => coverSelectors.findById(state, _id));
  const selection = selectedIDs.indexOf(_id) > -1 ? selectedIDs : [_id]
  const [{ isDragging }, drag, preview] = useDrag({
    item: {
      type: UIDragTypes.SEARCH_RESULTS,
      _id,
      selection
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    })
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])

  function _onClick(event: MouseEvent): void {
    onClick(event, index);
  }

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
    let shouldHandleClick = true;
    switch (cell.column.id) {
      case 'cover':
        shouldHandleClick = false;
        cellContent =
        <CoverView
          onDoubleClick={_onCoverDoubleClick}
          album={album}
          src={cover}/>
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
            {cell.value}{ isCurrent ? <FontAwesomeIcon className="icon" icon="volume-up"/> : null }
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
      <div {...cell.getCellProps()}
        className={`td cell cell-${cell.column.id}`}
        onClick={shouldHandleClick ? _onClick : null}>
        {cellContent}
      </div>
    );
  }
  const classNames = cx('search-result-list-item', 'tr', {
    'is-current' : isCurrent,
    'is-dragging': isDragging,
    'selected': selected
  });
  return (
    <div {...row.getRowProps()}
      ref={drag}
      className={classNames}
      style={{ ...style }}
      onContextMenu={_onConTextMenu}>
      {row.cells.map(renderCell)}
    </div>
  );
}
