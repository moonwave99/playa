import React, { ReactElement, MouseEvent, useRef } from 'react';
import { Album } from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
import { formatDuration } from '../../../utils/datetimeUtils';
import './PlaybackBar.scss';

type PlaybackBarProps = {
  currentAlbum: Album;
  currentTrack: Track;
}

export const PlaybackBar = ({
  currentAlbum,
  currentTrack
}: PlaybackBarProps): ReactElement => {

  const progressAreaRef = useRef(null);
  const progressCursorRef = useRef(null);

  function onMouseEnter(): void {
    progressCursorRef.current.style.opacity = 1;
  }

  function onMouseMove(event: MouseEvent): void {
    const waveformBounds = event.currentTarget.getBoundingClientRect();
    const percent = ((event.clientX - waveformBounds.left) / waveformBounds.width) * 100;
    progressCursorRef.current.style.left = `${percent}%`;
  }

  function onMouseLeave(): void {
    progressCursorRef.current.style.opacity = 0;
  }

	return (
    <section
      className="player-playback-bar"
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}>
      <span className="duration duration-elapsed">{formatDuration(0)}</span>
      <div className="info-wrapper">
        <p className="current-track-title">{currentTrack.title}</p>
        <p className="current-track-info">{currentTrack.artist} - {currentAlbum.title}</p>
      </div>
      <span className="duration duration-left">{formatDuration(currentTrack.duration)}</span>
      <div className="progress-area" ref={progressAreaRef}/>
      <div className="progress-cursor" ref={progressCursorRef}/>
    </section>
	);
}
