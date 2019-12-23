import React, { FC } from 'react';
import { ipcRenderer } from 'electron';
import { Album } from '../../../interfaces';
import { VARIOUS_ARTISTS_ID } from '../../../constants';

type ResultListItemProps = {
  result: Album;
};

export const ResultListItem: FC<ResultListItemProps> = ({ result }) => {
  const { type, artist, year, title } = result;
  const tagClasses = ['tag', `tag-${type}`].join(' ');
  const onClick = (): void => {
    ipcRenderer.send('reveal-in-finder', result);
  }
  return (
    <li className="result-list-item" onClick={onClick}>
      <span className={tagClasses}>{type}</span>
      <span className="year">{year ? year : '-'}</span>
      <span className="artist">{artist === VARIOUS_ARTISTS_ID ? 'V/A' : artist}</span>
      <span className="title">{title}</span>
    </li>
  );
}
