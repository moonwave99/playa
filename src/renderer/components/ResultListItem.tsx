import React, { FC } from 'react';
import { ipcRenderer } from 'electron';
import { Album } from '../../interfaces';

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
      <span className="year">{year}</span>
      <span className="artist">{artist}</span>
      <span className="title">{title}</span>
    </li>
  );
}
