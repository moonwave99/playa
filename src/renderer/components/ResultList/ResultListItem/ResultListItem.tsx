import React, { FC } from 'react';
import { useDrag } from 'react-dnd';
import cx from 'classnames';
import { Album } from '../../../store/modules/album';
import { AlbumDragType } from '../../../store/modules/ui';
import { VARIOUS_ARTISTS_ID } from '../../../../constants';

type ResultListItemProps = {
  result: Album;
  onContextMenu: Function;
};

export const ResultListItem: FC<ResultListItemProps> = ({ result, onContextMenu }) => {
  const { _id, type, artist, year, title } = result;
  const tagClasses = cx('tag', `tag-${type}`);

  const [{ opacity }, drag] = useDrag({
    item: {
      type: AlbumDragType,
      _id
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    })
  });

  function onClick(): void {
    onContextMenu(result);
  }

  return (
    <li ref={drag} className="result-list-item" onContextMenu={onClick} style={{ opacity }}>
      <span className={tagClasses}>{type}</span>
      <span className="year">{year ? year : '-'}</span>
      <span className="artist">{artist === VARIOUS_ARTISTS_ID ? 'V/A' : artist}</span>
      <span className="title">{title}</span>
    </li>
  );
}
