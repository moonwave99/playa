import React, { FC } from 'react';
import { Album } from '../../../store/modules/album';
import './AlbumView.scss';

type AlbumViewProps = {
  album: Album;
}

export const AlbumView: FC<AlbumViewProps> = ({
  album
}) => {
  const { _id, type, year, artist, title } = album;
  return (
    <article className="album-view">
      <div className="album-cover">
        <img src={`https://picsum.photos/seed/${_id}/200`}/>
      </div>
      <div className="album-content">
        <h2>{title}</h2>
        <h3>{artist}{year ? `, ${year}` : null} - {type}</h3>
      </div>
    </article>
  );
}
