import React, { FC } from 'react';
import cx from 'classnames';
import { Album, VARIOUS_ARTISTS_ID } from '../../../store/modules/album';
import './AlbumView.scss';

type AlbumViewProps = {
  album: Album;
}

export const AlbumView: FC<AlbumViewProps> = ({
  album
}) => {
  const { _id, type, year, artist, title } = album;
  const tagClasses = cx('album-type', `album-type-${type}`);
  return (
    <article className="album-view">
      <div className="album-cover">
        <img src={`https://picsum.photos/seed/${_id}/200`}/>
      </div>
      <div className="album-content">
        <h2>{title}</h2>
        <h3>
          {artist === VARIOUS_ARTISTS_ID ? 'V/A' : artist}{year ? `, ${year}` : null} · <span className={tagClasses}>{type}</span>
        </h3>
      </div>
    </article>
  );
}
