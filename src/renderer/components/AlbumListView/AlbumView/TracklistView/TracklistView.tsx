import React, { FC, ReactElement, SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { AlbumTypes } from '../../../../store/modules/album';
import { Track } from '../../../../store/modules/track';
import { formatTrackNumber } from '../../../../utils/tracklistUtils';
import { formatDuration } from '../../../../utils/datetimeUtils';
import { COLORS } from '../../../../../constants';
import { SEARCH } from '../../../../routes';
import './TracklistView.scss';

type TracklistViewProps = {
  albumType: AlbumTypes;
  currentTrackId: Track['_id'];
  tracklist: Track[];
  rawTracks: string[];
  isAlbumFromVariousArtists: boolean;
  onTrackDoubleClick: Function;
}

// #TODO reload onClick if some tracks are not found
export const TracklistView: FC<TracklistViewProps> = ({
  albumType,
  currentTrackId,
  tracklist = [],
  rawTracks = [],
  isAlbumFromVariousArtists,
  onTrackDoubleClick
}) => {
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
    return isAlbumFromVariousArtists || albumType === AlbumTypes.Remix
      ? <><Link className="artist" to={`${SEARCH}?query=${artist}`}>{artist}</Link>&nbsp;-&nbsp;</>
      : null;
  }

  function renderTrackNumber(number: number): ReactElement {
    const classNames = cx('track-number',
      { 'hidden' : albumType === AlbumTypes.Remix}
    );
    return <span className={classNames}>{formatTrackNumber(number)}</span>;
  }

  function renderTrack(track: Track): ReactElement {
    const { _id, found, title, artist, duration, number, path } = track;
    if (!found) {
      return renderSkeletonTrack(_id, path.length / maxNameLength * 100);
    }

    function onDoubleClick(event: SyntheticEvent): void {
      event.preventDefault();
      onTrackDoubleClick(track);
    }

    const isCurrent = _id === currentTrackId;
    const trackClassNames = cx('ready', {
      'is-current': isCurrent
    });

    return (
      <li key={_id} className={trackClassNames} onDoubleClick={onDoubleClick}>
        {renderTrackNumber(number)}
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
