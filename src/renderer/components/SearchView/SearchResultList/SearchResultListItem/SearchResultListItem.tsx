import React, { FC } from 'react';
import { useDrag } from 'react-dnd';
import cx from 'classnames';
import { Album, VARIOUS_ARTISTS_ID } from '../../../../store/modules/album';
import { UIAlbumDragType } from '../../../../store/modules/ui';

type SearchResultListItemProps = {
  result: Album;
  onContextMenu: Function;
};

export const SearchResultListItem: FC<SearchResultListItemProps> = ({ result, onContextMenu }) => {
  const { _id, type, artist, year, title } = result;
  
  const [{ opacity }, drag] = useDrag({
    item: {
      type: UIAlbumDragType,
      _id
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    })
  });

  function onClick(): void {
    onContextMenu(result);
  }

  const tagClasses = cx('tag', `tag-${type}`);
  return (
    <li ref={drag} className="search-result-list-item" onContextMenu={onClick} style={{ opacity }}>
      <span className={tagClasses}>{type}</span>
      <span className="year">{year ? year : '-'}</span>
      <span className="artist">{artist === VARIOUS_ARTISTS_ID ? 'V/A' : artist}</span>
      <span className="title">{title}</span>
    </li>
  );
}
