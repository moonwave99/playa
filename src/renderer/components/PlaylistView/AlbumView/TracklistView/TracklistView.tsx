import React, { FC, ReactElement, SyntheticEvent } from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { Playlist } from '../../../../store/modules/Playlist';
import { Album } from '../../../../store/modules/Album';
import { Track } from '../../../../store/modules/track';
import { playTrack } from '../../../../store/modules/player';
import { formatTrackNumber } from '../../../../utils/tracklistUtils';
import { formatDuration } from '../../../../utils/datetimeUtils';
import { COLORS } from '../../../../../constants';
import './TracklistView.scss';

type TracklistViewProps = {
  playlistId?: Playlist['_id'];
  albumId: Album['_id'];
  currentTrackId: Track['_id'];
  tracklist: Track[];
  rawTracks: string[];
  isAlbumFromVariousArtists: boolean;
}

// #TODO reload onClick if some tracks are not found
export const TracklistView: FC<TracklistViewProps> = ({
  playlistId,
  albumId,
  currentTrackId,
  tracklist = [],
  rawTracks = [],
  isAlbumFromVariousArtists
}) => {
  const dispatch = useDispatch();
  const maxNameLength = Math.max(...rawTracks.map(x => x.length));

  function renderSkeletonTrack(_id: string, width: number): ReactElement {
    const style = {
      backgroundImage: `linear-gradient(to right, ${COLORS.SKELETON_COLOR} ${width}%, transparent ${100 - width}% 100%)`
    };
    return <li key={_id} className="not-ready" style={style}></li>
  }

  function renderSkeletonTracklist(): ReactElement {
    return (
      <ol>
      {rawTracks.map((track) =>
        renderSkeletonTrack(track, track.length / maxNameLength * 100)
      )}
      </ol>
    );
  }

  function renderArtist(artist: string): ReactElement {
    return isAlbumFromVariousArtists
      ? <span className="artist">{artist}</span>
      : null;
  }

  function renderTrack(track: Track): ReactElement {
    const { _id, found, title, artist, duration, number, path } = track;
    if (!found) {
      return renderSkeletonTrack(_id, path.length / maxNameLength * 100);
    }

    function onTrackDoubleClick(event: SyntheticEvent): void {
      event.preventDefault();
      dispatch(playTrack({
        playlistId,
        albumId,
        trackId: _id
      }));
    }

    const isCurrent = _id === currentTrackId;
    const trackClassNames = cx('ready', {
      'is-current': isCurrent
    });

    return (
      <li key={_id} className={trackClassNames} onDoubleClick={onTrackDoubleClick}>
        <span className="track-number">{formatTrackNumber(number)}</span>
        <span className="playback-info">
          <FontAwesomeIcon
            icon={ isCurrent ? 'volume-up' : 'play'}
            className="track-icon"
            fixedWidth/>
        </span>
        {renderArtist(artist)}
        <span className="title">{title}</span>
        <span className="duration">{formatDuration(duration)}</span>
      </li>
    );
  }
  const classNames = cx('tracklist-view');
  return (
    <section className={classNames}>
      { tracklist.length > 0
        ? <ol>{ tracklist.map(renderTrack)}</ol>
        : renderSkeletonTracklist()
      }
    </section>
  );
}
