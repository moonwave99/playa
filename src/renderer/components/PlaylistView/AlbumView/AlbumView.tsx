import React, { FC, ReactElement, SyntheticEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import { CoverView } from './CoverView/CoverView';
import { TracklistView } from './TracklistView/TracklistView';
import { ApplicationState } from '../../../store/store';
import { playTrack } from '../../../store/modules/player';
import { Playlist } from '../../../store/modules/playlist';
import { Album, VARIOUS_ARTISTS_ID, getAlbumContentRequest } from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
import { getTrackListRequest } from '../../../store/modules/track';
import { getCoverRequest } from '../../../store/modules/cover';
import './AlbumView.scss';

type AlbumViewProps = {
  playlistId?: Playlist['_id'];
  album: Album;
  isCurrent: boolean;
  currentTrackId: Track['_id'];
  onContextMenu: Function;
}

export const AlbumView: FC<AlbumViewProps> = ({
  playlistId,
  album,
  isCurrent = false,
  currentTrackId,
  onContextMenu
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

  function onAlbumCoverDoubleClick(event: SyntheticEvent): void {
    event.preventDefault();
    dispatch(playTrack({
      playlistId,
      albumId: _id,
      trackId: tracks[0]
    }));
  }

  function renderNotFoundTracksButton(): ReactElement {
    return <button onClick={onNotFoundButtonClick} className="button button-outline">Reload</button>
  }

  const albumClasses = cx('album-view', { 'is-current': isCurrent });
  const tagClasses = cx('album-type', `album-type-${type}`);
  return (
    <article className={albumClasses}>
      <aside className="album-aside">
        <div onDoubleClick={onAlbumCoverDoubleClick}>
          <CoverView
            className="album-cover"
            src={cover}
            album={album}
            onContextMenu={onContextMenu}/>
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
          playlistId={playlistId}
          albumId={album._id}
          currentTrackId={currentTrackId}
          isAlbumFromVariousArtists={artist === VARIOUS_ARTISTS_ID}
          rawTracks={album.tracks}
          tracklist={tracklist}/>
      </section>
    </article>
  );
}
