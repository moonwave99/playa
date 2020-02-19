import React, { ReactElement, MouseEvent, useEffect, useState, useRef } from 'react';
import { Album } from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
import Player, { PLAYER_EVENTS } from '../../../lib/player';
import { formatDuration } from '../../../utils/datetimeUtils';
import './PlaybackBar.scss';

type PlaybackBarProps = {
  currentAlbum: Album;
  currentTrack: Track;
  player: Player;
  waveform: string;
  onProgressBarClick: Function;
  onWaveformNotFound: Function;
}

export const PlaybackBar = ({
  currentAlbum,
  currentTrack,
  player,
  waveform,
  onProgressBarClick,
  onWaveformNotFound
}: PlaybackBarProps): ReactElement => {
  const progressAreaRef = useRef(null);
  const progressCursorRef = useRef(null);
  const currentTimeRef = useRef(null);
  const durationLeftRef = useRef(null);
  const [waveformLoaded, setWaveformLoaded] = useState(false);

  useEffect(() => {
    function handlePlayerUpdate(): void {
      const { currentTime, duration } = player.getPlaybackInfo();
      (currentTimeRef.current as HTMLElement).innerHTML = formatDuration(Math.ceil(currentTime));
      (durationLeftRef.current as HTMLElement).innerHTML = `-${formatDuration(duration - currentTime)}`;
      progressAreaRef.current.style = `transform: translateX(${(currentTime / duration) * 100}%)`;
    }
    player.on(PLAYER_EVENTS.TICK, handlePlayerUpdate);
    return (): void => {
      player.removeListener(PLAYER_EVENTS.TICK, handlePlayerUpdate);
    };
  }, []);

  function onClick(event: MouseEvent): void {
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - bounds.left) / bounds.width;
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

	return (
    <section
      className="playback-bar"
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
      <span className="duration duration-elapsed" ref={currentTimeRef}>{formatDuration(0)}</span>
      <div className="info-wrapper">
        <p className="current-track-title">{currentTrack.title}</p>
        <p className="current-track-info">{currentTrack.artist} - {currentAlbum.title}</p>
      </div>
      <span className="duration duration-left" ref={durationLeftRef}>-{formatDuration(currentTrack.duration)}</span>
      <div className="progress-area" ref={progressAreaRef}/>
      <div className="progress-cursor" ref={progressCursorRef}/>
    </section>
	);
}
