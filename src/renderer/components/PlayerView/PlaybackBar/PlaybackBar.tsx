import React, { ReactElement, MouseEvent, useState, useEffect, useRef } from 'react';
import { Album } from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
import { formatDuration } from '../../../utils/datetimeUtils';
import './PlaybackBar.scss';

type PlaybackBarProps = {
  currentAlbum: Album;
  currentTrack: Track;
  currentTime: number;
  duration: number;
  waveform: string;
  onProgressBarClick: Function;
  onWaveformNotFound: Function;
}

const PROGRESS_AREA_CLICK_DEFER_TIME = 100;
const PROGRESS_AREA_TRACK_END_DEFER_TIME = 50;

export const PlaybackBar = ({
  currentAlbum,
  currentTrack,
  currentTime,
  duration,
  waveform,
  onProgressBarClick,
  onWaveformNotFound
}: PlaybackBarProps): ReactElement => {
  const progressAreaRef = useRef(null);
  const progressCursorRef = useRef(null);
  const [waveformLoaded, setWaveformLoaded] = useState(false);

  function disableTransition(time: number): void {
    progressAreaRef.current && progressAreaRef.current.classList.toggle('no-transition', true);
    setTimeout(
      () => progressAreaRef.current && progressAreaRef.current.classList.toggle('no-transition', false)
      , time
    );
  }

  useEffect(
    () => disableTransition(PROGRESS_AREA_TRACK_END_DEFER_TIME)
    , [currentTrack]
  );

  function onClick(event: MouseEvent): void {
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - bounds.left) / bounds.width;
    disableTransition(PROGRESS_AREA_CLICK_DEFER_TIME);
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

  function onWaveformLoad(): void {
    setWaveformLoaded(true);
  }

  function onWaveformError(): void {
    setWaveformLoaded(false);
    onWaveformNotFound();
  }

  const percent = (currentTime / duration) * 100;
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
      <div className="waveform">
        <img
          src={waveform}
          onLoad={onWaveformLoad}
          onError={onWaveformError}
          className={waveformLoaded ? 'loaded' : null}/>
      </div>
      <span className="duration duration-elapsed">{formatDuration(Math.ceil(currentTime))}</span>
      <div className="info-wrapper">
        <p className="current-track-title">{currentTrack.title}</p>
        <p className="current-track-info">{currentTrack.artist} - {currentAlbum.title}</p>
      </div>
      <span className="duration duration-left">-{formatDuration(duration - currentTime)}</span>
      <div className="progress-area" ref={progressAreaRef} style={progressAreaStyle}/>
      <div className="progress-cursor" ref={progressCursorRef}/>
    </section>
	);
}
