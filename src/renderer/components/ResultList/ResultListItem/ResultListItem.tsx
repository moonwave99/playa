import React, { FC } from 'react';
import { Album } from '../../../store/modules/album';
import { VARIOUS_ARTISTS_ID } from '../../../../constants';

type ResultListItemProps = {
  result: Album;
  onContextMenu: Function;
};

export const ResultListItem: FC<ResultListItemProps> = ({ result, onContextMenu }) => {
  const { type, artist, year, title } = result;
  const tagClasses = ['tag', `tag-${type}`].join(' ');
  const onClick = (): void => {
    onContextMenu(result);
  }
  return (
    <li className="result-list-item" onContextMenu={onClick}>
      <span className={tagClasses}>{type}</span>
      <span className="year">{year ? year : '-'}</span>
      <span className="artist">{artist === VARIOUS_ARTISTS_ID ? 'V/A' : artist}</span>
      <span className="title">{title}</span>
    </li>
  );
}
