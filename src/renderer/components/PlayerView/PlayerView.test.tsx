import * as React from 'react';
import { renderInAll, mockRouter } from '../../../../test/testUtils';
import { playlists, albums, tracks } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
import Player from '../../lib/player';

mockRouter({
  routeParams: { _id: '1' },
  routeMatch: { url: '/playlist/1' }
});

import { PlayerView } from './PlayerView';

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
  covers: {
    allById: {}
  },
  waveforms: {
    allById: {}
  }
};

const player = new Player({
	audioElement: document.createElement('audio')
});

describe('PlayerView tests', () => {
  it('should render a .player', () => {
    const wrapper = renderInAll(
			<PlayerView
				waveformBasePath=''
				player={player}/>,
			defaultStore);
    expect(wrapper.is('.player')).toBe(true);
  });

  it('should render the .player-controls', () => {
    const wrapper = renderInAll(
			<PlayerView
				waveformBasePath=''
				player={player}/>,
			defaultStore);
    expect(wrapper.find('.player-controls')).toHaveLength(1);
  });

  it('should render a .player-album-cover', () => {
    const wrapper = renderInAll(
			<PlayerView
				waveformBasePath=''
				player={player}/>,
			defaultStore);
    expect(wrapper.find('.player-album-cover')).toHaveLength(1);
  });

  it('should render no .playback-bar if no current track is set', () => {
    const wrapper = renderInAll(
			<PlayerView
				waveformBasePath=''
				player={player}/>,
				defaultStore);
    expect(wrapper.find('.playback-bar')).toHaveLength(0);
  });

  it('should render a .playback-bar if current track is set', () => {
    const wrapper = renderInAll(
			<PlayerView
				waveformBasePath=''
				player={player}/>,
			{
				...defaultStore,
				player: {
					queue: ['1', '2'],
					currentPlaylistId: '1',
					currentAlbumId: '1',
					currentTrackId: '1'
				}
			});
    expect(wrapper.find('.playback-bar')).toHaveLength(1);
  });

  it('should render no .volume-control if no current track is set', () => {
    const wrapper = renderInAll(
			<PlayerView
				waveformBasePath=''
				player={player}/>,
				defaultStore);
    expect(wrapper.find('.volume-control')).toHaveLength(0);
  });

  it('should render a .volume-control if current track is set', () => {
    const wrapper = renderInAll(
			<PlayerView
				waveformBasePath=''
				player={player}/>,
			{
				...defaultStore,
				player: {
					queue: ['1', '2'],
					currentPlaylistId: '1',
					currentAlbumId: '1',
					currentTrackId: '1'
				}
			});
    expect(wrapper.find('.volume-control')).toHaveLength(1);
  });
});
