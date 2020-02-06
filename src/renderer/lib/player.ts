import { EventEmitter } from 'events';
import { encodePath } from '../utils/pathUtils';

type PlayerParams = {
  audioElement: AudioElement;
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

export interface AudioElement extends EventTarget {
  play: Function;
  pause: Function;
  currentTime: number;
  duration: number;
  paused: boolean;
  src: string;
  currentSrc: string;
}

export default class Player extends EventEmitter {
  private audioElement: AudioElement;
  constructor({ audioElement }: PlayerParams) {
    super();
    this.audioElement = audioElement;
    this.audioElement.addEventListener('playing', this._onPlaying.bind(this));
    this.audioElement.addEventListener('pause', this._onPause.bind(this));
    this.audioElement.addEventListener('ended', this._onEnded.bind(this));
    this.audioElement.addEventListener('error', this._onError.bind(this));
    this.audioElement.addEventListener('timeupdate', this._onTimeupdate.bind(this));
  }
  loadTrack(path: string): void {
    if (path) {
      this.audioElement.src = encodePath(path);
    }
  }
  play(): void {
    this.audioElement.play();
  }
  pause(): void {
    this.audioElement.pause();
  }
  togglePlayback(): void {
    if (!this.audioElement.src) {
      return;
    }
    if (!this.audioElement.paused) {
      this.audioElement.pause();
    } else {
      this.audioElement.play();
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
      isPlaying: !this.audioElement.paused
    };
  }
  isPlaying(): boolean {
    return !this.audioElement.paused;
  }
  onLoad(handler: (event: Event) => void): () => void {
    this.audioElement.addEventListener('loadedmetadata', handler);
    return (): void => this.audioElement.removeEventListener('loadedmetadata', handler);
  }
  private _onPlaying(): void {
    this.emit(PLAYER_EVENTS.PLAY, this.getPlaybackInfo());
  }
  private _onPause(): void {
    this.emit(PLAYER_EVENTS.PAUSE, this.getPlaybackInfo());
  }
  private _onEnded(): void {
    this.emit(PLAYER_EVENTS.TRACK_ENDED, this.audioElement.src);
  }
  private _onError(error: Error): void {
    this.emit(PLAYER_EVENTS.ERROR, error, this.getPlaybackInfo());
  }
  private _onTimeupdate(): void {
    this.emit(PLAYER_EVENTS.TICK, this.getPlaybackInfo());
  }
}
