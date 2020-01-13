import React, { FC, ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import { CoverView } from './CoverView/CoverView';
import { TracklistView } from './TracklistView/TracklistView';
import { ApplicationState } from '../../../store/store';
import { Album, VARIOUS_ARTISTS_ID, getAlbumContentRequest } from '../../../store/modules/album';
import { getTrackListRequest } from '../../../store/modules/track';
import { getCoverRequest } from '../../../store/modules/cover';
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

  const cover = useSelector((state: ApplicationState) => {
    return state.covers.allById[_id];
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

  useEffect(() => {
    dispatch(getCoverRequest(album));
  }, []);

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
        <CoverView
          className="album-cover"
          src={cover}
          title={`[${_id}] ${artist} - ${title}`}/>
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
          isAlbumFromVariousArtists={artist === VARIOUS_ARTISTS_ID}
          rawTracks={album.tracks}
          tracklist={tracklist}/>
      </section>
    </article>
  );
}
