import React, { FC, ReactElement } from 'react';
import cx from 'classnames';
import { Track } from '../../../../store/modules/track';
import { formatTrackNumber } from '../../../../utils/tracklist';
import { formatDuration } from '../../../../utils/datetime';
import { COLORS } from '../../../../../constants';
import './TracklistView.scss';

type TracklistViewProps = {
  tracklist: Track[];
  rawTracks: string[];
  isAlbumFromVariousArtists: boolean;
}

// #TODO reload onClick if some tracks are not found
export const TracklistView: FC<TracklistViewProps> = ({
  tracklist = [],
  rawTracks = [],
  isAlbumFromVariousArtists
}) => {

  const maxNameLength = Math.max(...rawTracks.map(x => x.length));

  function renderSkeletonTrack(_id: string, width: number): ReactElement {
    const style = {
      background: `linear-gradient(to right, ${COLORS.SKELETON_COLOR} ${width}%, transparent ${100 - width}% 100%)`
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
    return (
      <li key={_id} >
        <span className="track-number">{formatTrackNumber(number)}</span>
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
