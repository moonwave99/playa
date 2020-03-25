import { MockAudioElement, DEFAULT_TRACK_DURATION } from '../../../test/mockAudioElement';
import Player, { PlaybackInfo, PLAYER_EVENTS } from './player';

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

  describe('play', () => {
    it('should play loaded track', () => {
      const player = new Player({
        audioElement: new MockAudioElement()
      });
      player.loadTrack('/path/to/track');
      player.play();
      expect(player.isPlaying()).toBe(true);
    });
  });

  describe('pause', () => {
    it('should pause loaded track', () => {
      const player = new Player({
        audioElement: new MockAudioElement()
      });
      player.loadTrack('/path/to/track');
      player.pause();
      expect(player.isPlaying()).toBe(false);
    });
  });

  describe('togglePlayback', () => {
    it('should toggle playback', () => {
      const player = new Player({
        audioElement: new MockAudioElement()
      });
      player.loadTrack('/path/to/track');
      player.togglePlayback();
      expect(player.isPlaying()).toBe(true);
      player.togglePlayback();
      expect(player.isPlaying()).toBe(false);
    });
  });

  describe('volume', () => {
    it('should get and set volume', () => {
      const player = new Player({
        audioElement: new MockAudioElement()
      });
      player.setVolume(0.5);
      expect(player.getVolume()).toBe(0.5);
    });
  });

  describe('seekTo', () => {
    it('should seek loaded track to given position', () => {
      const player = new Player({
        audioElement: new MockAudioElement()
      });
      player.loadTrack('/path/to/track');
      player.seekTo(0.5);
      const { currentTime } = player.getPlaybackInfo();
      expect(currentTime).toBe(DEFAULT_TRACK_DURATION * 0.5);
    });
  });
});
