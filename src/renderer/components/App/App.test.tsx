import React from 'react';
import { MockAudioElement } from '../../../../test/mockAudioElement'
import { renderInAll } from '../../../../test/testUtils';
import { albums, artists } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
import Player from '../../lib/player';

import { App } from './App';

const defaultStore = {
  playlists: {
    allById: {}
  },
  albums: {
    allById: toObj(albums)
  },
  artists: {
    allById: toObj(artists)
  },
  tracks: {
    allById: {}
  },
  covers: {
    allById: {}
  },
  waveforms: {
    allById: {}
  },
  player: {
    currentAlbumId: null as string,
    queue: [] as string[]
  },
  ui: {
    title: {}
  }
};

describe('App', () => {
  it('should render an .app', () => {
		const wrapper = renderInAll(
			<App
        player={new Player({ audioElement: new MockAudioElement() })}
        queue={[]}
        waveformBasePath="/path/to/waveforms"
        lastOpenedPlaylistId={null}/>
		, defaultStore);
		expect(wrapper.is('.app')).toBe(true);
  });
});
