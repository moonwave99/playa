import React, { FC, ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import cx from 'classnames';
import { CoverView } from './CoverView/CoverView';
import { TracklistView } from './TracklistView/TracklistView';
import { ApplicationState } from '../../../store/store';
import { Album, AlbumTypes, VARIOUS_ARTISTS_ID, getAlbumContentRequest } from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
import { getTrackListRequest } from '../../../store/modules/track';
import { getCoverRequest } from '../../../store/modules/cover';
import { SEARCH } from '../../../routes';
import './AlbumView.scss';

type AlbumViewProps = {
  album: Album;
  isCurrent: boolean;
  currentTrackId: Track['_id'];
  onContextMenu: Function;
  onDoubleClick: Function;
}

export const AlbumView: FC<AlbumViewProps> = ({
  album,
  isCurrent = false,
  currentTrackId,
  onContextMenu,
  onDoubleClick
}) => {
  const { _id, type, year, artist, title, tracks } = album;
  const { tracklist, notFoundTracks, cover } = useSelector((state: ApplicationState) => {
    const tracklist = tracks.map((id) => state.tracks.allById[id]).filter(x => !!x) || [];
    return {
      tracklist,
      notFoundTracks: tracklist.filter(({ found }) => found === false).length > 0,
      cover: state.covers.allById[_id]
    };
  });

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

  function onCoverDoubleClick(album: Album): void {
    onDoubleClick(album);
  }

  function onTrackDoubleClick(track: Track): void {
    onDoubleClick(album, track);
  }

  function renderArtist(): ReactElement {
    return <Link
      to={`${generatePath(SEARCH)}?query=artist: ${artist}`}
      className="album-artist">
        {artist === VARIOUS_ARTISTS_ID ? 'V/A' : artist}
      </Link>;
  }

  function renderNotFoundTracksButton(): ReactElement {
    return <button
      onClick={onNotFoundButtonClick}
      className="button button-outline">Reload tracks</button>
  }

  const showTrackNumbers = [
    AlbumTypes.Remix,
    AlbumTypes.Various
  ].indexOf(type) < 0;

  const albumClasses = cx('album-view', { 'is-current': isCurrent });
  const tagClasses = cx('album-type', `album-type-${type}`);
  const showArtists = artist === VARIOUS_ARTISTS_ID || type === AlbumTypes.Remix;
  return (
    <article className={albumClasses} id={_id}>
      <aside className="album-aside">
        <CoverView
          className="album-cover"
          src={cover}
          album={album}
          onDoubleClick={onCoverDoubleClick}
          onContextMenu={onContextMenu}/>
        <div className="album-actions">
        { notFoundTracks && renderNotFoundTracksButton() }
        </div>
      </aside>
      <section className="album-content">
        <header>
          <h2>{title}</h2>
          <h3>
            {renderArtist()}{year ? `, ${year}` : null} - <span className={tagClasses}>{type}</span>
          </h3>
        </header>
        <TracklistView
          currentTrackId={currentTrackId}
          showArtists={showArtists}
          showTrackNumbers={showTrackNumbers}
          rawTracks={tracks}
          tracklist={tracklist}
          onTrackDoubleClick={onTrackDoubleClick}/>
      </section>
    </article>
  );
}
