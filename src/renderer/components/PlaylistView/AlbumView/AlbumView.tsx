import React, { FC, ReactElement, useEffect } from 'react';
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
  const { _id, type, year, artist, title, tracks } = album;

  const tracklist = useSelector((state: ApplicationState) => {
    return tracks.map((id) => state.tracks.allById[id]).filter(x => !!x) || [];
  });

  const notFoundTracks = tracklist.filter(({ found }) => found === false).length > 0;

  const dispatch = useDispatch();
  useEffect(() => {
    if (tracks.length === 0) {
      dispatch(getAlbumContentRequest(album));
    } else {
      dispatch(getTrackListRequest(tracks));
    }
  }, [tracks.length]);

  function onNotFoundButtonClick(): void {
    dispatch(getAlbumContentRequest(album));
  }

  function renderNotFoundTracksButton(): ReactElement {
    return <button onClick={onNotFoundButtonClick} className="button button-outline">Reload</button>
  }

  const tagClasses = cx('album-type', `album-type-${type}`);

  return (
    <article className="album-view">
      <aside className="album-aside">
        <div className="album-cover">
          <img src={`https://picsum.photos/seed/${_id}/200`}/>
        </div>
        <div className="album-actions">
        { notFoundTracks && renderNotFoundTracksButton() }
        </div>
      </aside>
      <section className="album-content">
        <h2>{title}</h2>
        <h3>
          {artist === VARIOUS_ARTISTS_ID ? 'V/A' : artist}{year ? `, ${year}` : null} - <span className={tagClasses}>{type}</span>
        </h3>
        <TracklistView
          rawTracks={album.tracks}
          tracklist={tracklist}/>
      </section>
    </article>
  );
}
