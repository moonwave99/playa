import React, { ReactElement, MouseEvent, useRef } from 'react';
import { Album } from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
import { formatDuration } from '../../../utils/datetimeUtils';
import './PlaybackBar.scss';

type PlaybackBarProps = {
  currentAlbum: Album;
  currentTrack: Track;
  currentTime: number;
  onProgressBarClick: Function;
}

const PROGRESS_AREA_CLICK_DEFER_TIME = 100;

export const PlaybackBar = ({
  currentAlbum,
  currentTrack,
  currentTime,
  onProgressBarClick
}: PlaybackBarProps): ReactElement => {

  const progressAreaRef = useRef(null);
  const progressCursorRef = useRef(null);

  function onClick(event: MouseEvent): void {
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - bounds.left) / bounds.width;
    progressAreaRef.current.classList.toggle('clicked', true);
    setTimeout(
      () => progressAreaRef.current.classList.toggle('clicked', false)
      , PROGRESS_AREA_CLICK_DEFER_TIME
    );
    onProgressBarClick(position);
  }

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

  const percent = (currentTime / currentTrack.duration) * 100;
  const progressAreaStyle = {
    transform: `translateX(${percent}%)`,
  };

	return (
    <section
      className="player-playback-bar"
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}>
      <span className="duration duration-elapsed">{formatDuration(currentTime)}</span>
      <div className="info-wrapper">
        <p className="current-track-title">{currentTrack.title}</p>
        <p className="current-track-info">{currentTrack.artist} - {currentAlbum.title}</p>
      </div>
      <span className="duration duration-left">-{formatDuration(currentTrack.duration - currentTime)}</span>
      <div className="progress-area" ref={progressAreaRef} style={progressAreaStyle}/>
      <div className="progress-cursor" ref={progressCursorRef}/>
    </section>
	);
}
