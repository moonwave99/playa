import React from 'react';
import { renderInAll, mountInAll } from '../../../../../test/testUtils';
import { playlists, albums, tracks } from '../../../../../test/testFixtures';
import { toObj } from '../../../utils/storeUtils';
import { formatDuration } from '../../../utils/datetimeUtils';
import Player from '../../../lib/player';

import { PlaybackBar } from './PlaybackBar';

const defaultStore = {
  player: {
    queue: [] as string[]
  },
  playlists: {
    allById: toObj(playlists)
  },
  albums: {
    allById: toObj(albums)
  },
  tracks: {
    allById: toObj(tracks)
  },
  waveforms: {
    allById: {}
  }
};

describe('PlaybackBar', () => {
  const player = new Player({
    audioElement: document.createElement('audio')
  });
  it('should render a .playback-bar', () => {
    const wrapper = renderInAll(
			<PlaybackBar
        currentAlbum={albums[0]}
        currentTrack={tracks[0]}
        player={player}
        waveform='/path/to/waveform'
				onWaveformNotFound={jest.fn()}
				onProgressBarClick={jest.fn()}/>,
			defaultStore);
    expect(wrapper.is('.playback-bar')).toBe(true);
  });

  it('should contain a .waveform', () => {
    const wrapper = renderInAll(
			<PlaybackBar
        currentAlbum={albums[0]}
        currentTrack={tracks[0]}
        player={player}
        waveform='/path/to/waveform'
				onWaveformNotFound={jest.fn()}
				onProgressBarClick={jest.fn()}/>,
			defaultStore);
    expect(wrapper.find('.waveform')).toHaveLength(1);
  });

  it('should display the current track information', () => {
    const wrapper = renderInAll(
			<PlaybackBar
        currentAlbum={albums[0]}
        currentTrack={tracks[0]}
        player={player}
        waveform='/path/to/waveform'
				onWaveformNotFound={jest.fn()}
				onProgressBarClick={jest.fn()}/>,
			defaultStore);
    expect(wrapper.find('.current-track-title').text()).toBe(tracks[0].title);
    expect(wrapper.find('.current-track-info').text()).toBe(`${tracks[0].artist} - ${albums[0].title}`);
  });

  it('should display the elapsed time', () => {
    const wrapper = renderInAll(
			<PlaybackBar
        currentAlbum={albums[0]}
        currentTrack={tracks[0]}
        player={player}
        waveform='/path/to/waveform'
				onWaveformNotFound={jest.fn()}
				onProgressBarClick={jest.fn()}/>,
			defaultStore);
    expect(wrapper.find('.duration-elapsed').text()).toBe(formatDuration(0));
  });

  it('should display the time left', () => {
    const wrapper = renderInAll(
			<PlaybackBar
        currentAlbum={albums[0]}
        currentTrack={tracks[0]}
        player={player}
        waveform='/path/to/waveform'
				onWaveformNotFound={jest.fn()}
				onProgressBarClick={jest.fn()}/>,
			defaultStore);
    expect(wrapper.find('.duration-left').text()).toBe(`-${formatDuration(tracks[0].duration)}`);
  });

  it('should call the onProgressBarClick handler when progress bar is clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
			<PlaybackBar
        currentAlbum={albums[0]}
        currentTrack={tracks[0]}
        player={player}
        waveform='/path/to/waveform'
				onWaveformNotFound={jest.fn()}
				onProgressBarClick={handler}/>,
			defaultStore);

    wrapper.simulate('click');
    expect(handler).toHaveBeenCalled();
  });
});
