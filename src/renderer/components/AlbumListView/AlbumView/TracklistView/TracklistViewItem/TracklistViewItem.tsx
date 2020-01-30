import React, { FC, ReactElement, SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { Track } from '../../../../../store/modules/track';
import { formatTrackNumber } from '../../../../../utils/tracklistUtils';
import { formatDuration } from '../../../../../utils/datetimeUtils';
import { SEARCH } from '../../../../../routes';

type TracklistViewItemProps = {
  track: Track;
  isCurrent?: boolean;
  showArtists?: boolean;
  showTrackNumber?: boolean;
  onTrackDoubleClick?: Function;
}

// #TODO reload onClick if some tracks are not found
export const TracklistViewItem: FC<TracklistViewItemProps> = ({
  track,
  isCurrent = false,
  showTrackNumber = true,
  showArtists = false,
  onTrackDoubleClick
}) => {
  const { title, artist, duration, number } = track;

  function renderArtist(artist: string): ReactElement {
    return showArtists
      ? <><Link className="artist" to={`${SEARCH}?query=artist: ${artist}`}>{artist}</Link>&nbsp;-&nbsp;</>
      : null;
  }

  function renderTrackNumber(number: number): ReactElement {
    const classNames = cx('track-number',
      { 'hidden' : !showTrackNumber}
    );
    return <span className={classNames}>{formatTrackNumber(number)}</span>;
  }

  function onDoubleClick(event: SyntheticEvent): void {
    event.preventDefault();
    onTrackDoubleClick && onTrackDoubleClick(track);
  }

  const trackClassNames = cx('ready', {
    'is-current': isCurrent
  });

  return (
    <li className={trackClassNames} onDoubleClick={onDoubleClick}>
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
