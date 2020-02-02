import { EventEmitter } from 'events';
import { encodePath } from '../utils/pathUtils';

type PlayerParams = {
  audioElement: HTMLAudioElement;
  resolution?: number;
}

export type PlaybackInfo = {
  currentTime: number;
  duration: number;
  currentTrack: string;
  isPlaying: boolean;
}

export const PLAYER_EVENTS = {
  PLAY: 'player:play',
  PAUSE: 'player:pause',
  TICK: 'player:tick',
  TRACK_ENDED: 'player:track-ended',
  ERROR: 'player:error'
};

const DEFAULT_RESOLUTION = 1000;

export default class Player extends EventEmitter {
  private audioElement: HTMLAudioElement;
  private resolution: number;
  private playing: boolean;
  private timer: number;
  constructor({
    audioElement,
    resolution = DEFAULT_RESOLUTION,
  }: PlayerParams) {
    super();
    this.audioElement = audioElement;
    this.resolution = resolution;
    this.audioElement.onplaying = this._onPlaying.bind(this);
    this.audioElement.onpause = this._onPause.bind(this);
    this.audioElement.onended = this._onEnded.bind(this);
    this.audioElement.onerror = this._onError.bind(this);
  }
  loadTrack(path: string): void {
    if (path) {
      this.audioElement.src = encodePath(path);
    }
    this.playing = false;
  }
  play(): void {
    if (!this.playing) {
      this.audioElement.play();
    }
  }
  pause(): void {
    if (this.playing) {
      this.audioElement.pause();
    }
  }
  togglePlayback(): void {
    if (!this.audioElement.src) {
      return;
    }
    if (this.playing) {
      this.audioElement.pause();
      this.playing = false;
    } else {
      this.audioElement.play();
      this.playing = true;
    }
  }
  seekTo(position: number): void {
    this.audioElement.currentTime = this.audioElement.duration * position;
  }
  getPlaybackInfo(): PlaybackInfo {
    return {
      currentTime: this.audioElement.currentTime,
      duration: this.audioElement.duration,
      currentTrack: this.audioElement.currentSrc,
      isPlaying: this.playing
    };
  }
  isPlaying(): boolean {
    return this.playing;
  }
  onLoad(handler: (event: Event) => void): () => void {
    this.audioElement.addEventListener('loadedmetadata', handler);
    return (): void => this.audioElement.removeEventListener('loadedmetadata', handler);
  }
  private _onPlaying(): void {
    this._startTimer();
    this.playing = true;
    this.emit(PLAYER_EVENTS.PLAY, this.getPlaybackInfo());
  }
  private _onPause(): void {
    this._clearTimer();
    this.playing = false;
    this.emit(PLAYER_EVENTS.PAUSE, this.getPlaybackInfo());
  }
  private _onEnded(): void {
    this._clearTimer();
    this.playing = false;
    this.emit(PLAYER_EVENTS.TRACK_ENDED, this.audioElement.src);
  }
  private _onError(error: Error): void {
    this.emit(PLAYER_EVENTS.ERROR, error, this.getPlaybackInfo());
  }
  private _startTimer(): void {
    if (this.timer) {
      return;
    }
    this.timer = window.setInterval(
      () => this.emit(PLAYER_EVENTS.TICK, this.getPlaybackInfo()), this.resolution
    );
  }
  private _clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = null;
  }
}
