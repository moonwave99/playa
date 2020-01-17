import { EventEmitter } from 'events';

type PlayerParams = {
  audioElement: HTMLAudioElement;
  resolution?: number;
}

export type PlaybackInfo = {
  currentTime: number;
  duration: number;
  currentTrack: string;
}

export const PLAYER_EVENTS = {
  PLAY: 'player:play',
  PAUSE: 'player:pause',
  TICK: 'player:tick',
  TRACK_ENDED: 'player:track-ended'
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
  }
  loadTrack(path: string): void {
    if (path) {
      this.audioElement.src = path;
    }
    this.playing = false;
  }
  play(): void {
    if (!this.playing) {
      this.audioElement.play();
      this.playing = true;
    }
  }
  pause(): void {
    if (this.playing) {
      this.audioElement.pause();
      this.playing = false;
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
    // const currentTime = Math.min(
    //   Math.ceil(this.audioElement.currentTime),
    //   this.audioElement.duration
    // );
    return {
      currentTime: this.audioElement.currentTime,
      duration: this.audioElement.duration,
      currentTrack: this.audioElement.currentSrc
    };
  }
  isPlaying(): boolean {
    return this.playing;
  }
  private _onPlaying(): void {
    this._startTimer();
    this.playing = true;
    this.emit(PLAYER_EVENTS.PLAY);
  }
  private _onPause(): void {
    this._clearTimer();
    this.playing = false;
    this.emit(PLAYER_EVENTS.PAUSE);
  }
  private _onEnded(): void {
    this._clearTimer();
    this.playing = false;
    this.emit(PLAYER_EVENTS.TRACK_ENDED, this.audioElement.src);
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
    this.playing = false;
  }
}
