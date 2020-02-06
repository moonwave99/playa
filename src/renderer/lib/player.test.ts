import { EntityHashMap } from '../utils/storeUtils';
import Player, { PlaybackInfo, PLAYER_EVENTS } from './player';

class MockAudioElement extends EventTarget {
  private listeners: EntityHashMap<EventListenerOrEventListenerObject[]>;
  public paused: boolean;
  public currentTime: number;
  public duration: number;
  public src: string;
  public currentSrc: string;
  constructor() {
    super();
    this.paused = true;
    this.listeners = {};
  }
  play(): void {
    this.paused = false;
    this.dispatchEvent(new Event('playing'));
  }
  pause(): void {
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }
  addEventListener(event: string, listener: EventListenerOrEventListenerObject): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }
  removeEventListener(event: string, listener: EventListenerOrEventListenerObject): void {
    this.listeners[event] = this.listeners[event].filter((x: EventListenerOrEventListenerObject) => x !== listener);
  }
  dispatchEvent(event: Event): boolean {
    if (!this.listeners[event.type]) {
      return false;
    }
    this.listeners[event.type].forEach((listener: EventListener) => listener(event));
    return true;
  }
}

describe('Player', () => {
  it('should reflect playback state', () => {
    const player = new Player({
      audioElement: new MockAudioElement()
    });
    let info = player.getPlaybackInfo();
    expect(info.isPlaying).toBe(false);

    player.play();
    info = player.getPlaybackInfo();
    expect(info.isPlaying).toBe(true);

    player.pause();
    info = player.getPlaybackInfo();
    expect(info.isPlaying).toBe(false);
  });

  it('should emit events', () => {
    const audioElement = new MockAudioElement();
    const player = new Player({ audioElement });

    player.on(PLAYER_EVENTS.PLAY, ({ isPlaying }: PlaybackInfo) => {
      expect(isPlaying).toBe(true);
    });

    player.on(PLAYER_EVENTS.PAUSE, ({ isPlaying }: PlaybackInfo) => {
      expect(isPlaying).toBe(false);
    });

    player.play();
    player.pause();

    const trackEndedHandler = jest.fn();
    player.on(PLAYER_EVENTS.TRACK_ENDED, trackEndedHandler);
    audioElement.dispatchEvent(new Event('ended'));
    expect(trackEndedHandler).toHaveBeenCalled();

    const tickHandler = jest.fn();
    player.on(PLAYER_EVENTS.TICK, tickHandler);
    audioElement.dispatchEvent(new Event('timeupdate'));
    expect(tickHandler).toHaveBeenCalled();

    const errorHandler = jest.fn();
    player.on(PLAYER_EVENTS.ERROR, errorHandler);
    audioElement.dispatchEvent(new Event('error'));
    expect(errorHandler).toHaveBeenCalled();

    Object.values(PLAYER_EVENTS).forEach(
      event => player.removeAllListeners(event)
    );
  });
});
