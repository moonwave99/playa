import React, { FC, ReactElement } from 'react';
import cx from 'classnames';
import { Track } from '../../../../store/modules/track';
import { formatTrackNumber, formatDuration } from '../../../../utils/tracklist';
import './TracklistView.scss';

type TracklistViewProps = {
  tracklist: Track[];
  rawTracks: string[];
}

// #TODO reload onClick if some tracks are not found
export const TracklistView: FC<TracklistViewProps> = ({
  tracklist = [],
  rawTracks = []
}) => {

  const maxNameLength = Math.max(...rawTracks.map(x => x.length));

  function renderSkeletonTrack(_id: string, width: number): ReactElement {
    return <li key={_id} className="not-ready" style={{ width: `${width}%` }}></li>
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

  function renderTrack(track: Track): ReactElement {
    const { _id, found, title, duration, number, path } = track;
    if (!found) {
      return renderSkeletonTrack(_id, path.length / maxNameLength * 100);
    }
    return (
      <li key={_id} >
        {formatTrackNumber(number)}. {title}
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
