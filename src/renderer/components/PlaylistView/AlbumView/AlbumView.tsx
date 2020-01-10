import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import { TracklistView } from './TracklistView/TracklistView';
import { ApplicationState } from '../../../store/store';
import { Album, VARIOUS_ARTISTS_ID, getAlbumContentRequest } from '../../../store/modules/album';
import { getTrackListRequest } from '../../../store/modules/track';
import './AlbumView.scss';

type AlbumViewProps = {
  album: Album;
}

export const AlbumView: FC<AlbumViewProps> = ({
  album
}) => {
  const dispatch = useDispatch();
  const { _id, type, year, artist, title, tracks } = album;

  const tracklist = useSelector((state: ApplicationState) => {
    return state.tracks.allByAlbumId[_id] || [];
  });

  useEffect(() => {
    if (tracks && tracks.length > 0) {
      dispatch(getTrackListRequest(tracks, _id));
    } else {
      dispatch(getAlbumContentRequest(album));
    }
  }, [tracks]);

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
        <TracklistView tracklist={tracklist}/>
      </div>
    </article>
  );
}
