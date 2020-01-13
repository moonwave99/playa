import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import { CoverView } from '../AlbumView/CoverView/CoverView';
import { ApplicationState } from '../../../store/store';
import { Album, VARIOUS_ARTISTS_ID } from '../../../store/modules/album';
import { getCoverRequest } from '../../../store/modules/cover';
import './CompactAlbumView.scss';

type CompactAlbumViewProps = {
  album: Album;
}

export const CompactAlbumView: FC<CompactAlbumViewProps> = ({
  album
}) => {
  const { _id, type, year, artist, title } = album;

  const cover = useSelector((state: ApplicationState) => {
    return state.covers.allById[_id];
  });

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCoverRequest(album));
  }, []);

  const tagClasses = cx('album-type', `album-type-${type}`);
  return (
    <article className="compact-album-view">
      <CoverView
        className="album-cover"
        src={cover}
        title={`[${_id}] ${artist} - ${title}`}/>
      <p className="album-content">
        <span className="title">{title}</span>
        <span className="info">
          {artist === VARIOUS_ARTISTS_ID ? 'V/A' : artist}{year ? `, ${year}` : null} - <span className={tagClasses}>{type}</span>
        </span>
      </p>
    </article>
  );
}
