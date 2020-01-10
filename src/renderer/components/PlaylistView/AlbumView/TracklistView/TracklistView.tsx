import React, { FC, ReactElement } from 'react';
import { Track } from '../../../../store/modules/track';
import './TracklistView.scss';

type TracklistViewProps = {
  tracklist: Track[];
}

export const TracklistView: FC<TracklistViewProps> = ({
  tracklist = []
}) => {
  function renderTrack(track: Track): ReactElement {
    return (
      <li key={track._id}>{track.number}. {track.title}</li>
    );
  }
  return (
    <section className="tracklist-view">
      <ol>{ tracklist.map(renderTrack)}</ol>
    </section>
  );
}
