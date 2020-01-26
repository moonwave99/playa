import React, { FC, ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import cx from 'classnames';
import { CoverView } from './CoverView/CoverView';
import { TracklistView } from './TracklistView/TracklistView';
import { ApplicationState } from '../../../store/store';
import { Album, AlbumTypes, VARIOUS_ARTISTS_ID, getAlbumRequest } from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
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
  const { _id, type, year, artist, title } = album;
  const {
    tracklist,
    notFoundTracks,
    cover
  } = useSelector(({ tracks, covers }: ApplicationState) => {
    const tracklist =
      album.tracks
        .map((id) => tracks.allById[id])
        .filter(x => !!x) || [];
    return {
      tracklist,
      notFoundTracks: tracklist.filter(({ found }) => found === false).length > 0,
      cover: covers.allById[_id]
    };
  });

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAlbumRequest(_id));
  }, [_id]);

  function onNotFoundButtonClick(): void {
    dispatch(getAlbumRequest(_id));
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
      className="album-artist-link">
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
        <header>
          <h2>{title}</h2>
          <p className="album-artist">{renderArtist()}</p>
          <p className="album-info">{year ? `${year} - ` : null}<span className={tagClasses}>{type}</span></p>
        </header>
        <div className="album-actions">
          { notFoundTracks && renderNotFoundTracksButton() }
        </div>
      </aside>
      <section className="album-content">
        <TracklistView
          currentTrackId={currentTrackId}
          showArtists={showArtists}
          showTrackNumbers={showTrackNumbers}
          rawTracks={album.tracks}
          tracklist={tracklist}
          onTrackDoubleClick={onTrackDoubleClick}/>
      </section>
    </article>
  );
}
