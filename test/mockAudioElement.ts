import { EntityHashMap } from '../src/renderer/utils/storeUtils';

export const DEFAULT_TRACK_DURATION = 100;

export class MockAudioElement extends EventTarget {
  private listeners: EntityHashMap<EventListenerOrEventListenerObject[]>;
  public paused: boolean;
  public currentTime: number;
  public duration: number;
  public src: string;
  public volume: number;
  public currentSrc: string;
  constructor(duration: number = DEFAULT_TRACK_DURATION) {
    super();
    this.paused = true;
    this.duration = duration;
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
