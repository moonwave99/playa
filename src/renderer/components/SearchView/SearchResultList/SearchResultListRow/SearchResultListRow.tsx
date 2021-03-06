import React, { ReactElement, MouseEvent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import { Row, Cell } from 'react-table';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CoverView } from '../../../CoverView/CoverView';
import { UIDragTypes } from '../../../../store/modules/ui';
import { Album } from '../../../../store/modules/album';
import { selectors as artistSelectors } from '../../../../store/modules/artist';
import { ApplicationState } from '../../../../store/store';
import { formatArtist } from '../../../../utils/albumUtils';
import { ARTIST_SHOW } from '../../../../routes';

type SearchResultListRowProps = {
  row: Row;
  index: number;
  album: Album;
  selected?: boolean;
  isCurrent?: boolean;
  onClick?: Function;
  onContextMenu?: Function;
  onCoverDoubleClick?: Function;
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
  const { _id, artist: artistId, cover } = album;
  const artist = useSelector((state: ApplicationState) => artistSelectors.findById(state, artistId));
  const selection = selectedIDs.indexOf(_id) > -1 ? selectedIDs : [_id];
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
    onClick && onClick(event, index);
  }

  function _onConTextMenu(): void {
    onContextMenu && onContextMenu(album, artist);
  }

  function _onCoverDoubleClick(): void {
    onCoverDoubleClick && onCoverDoubleClick(album, artist);
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
          className="loaded"
          album={album}
          src={cover}/>
        break;
      case 'artist':
        cellContent =
          <Link
            to={generatePath(ARTIST_SHOW, { _id: artistId })}
            className="album-artist-link">{formatArtist({ album, artist })}
          </Link>
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
