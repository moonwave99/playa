import * as React from 'react';
import { renderInAll, mockRouter } from '../../../../test/testUtils';
import { playlists, albums } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';

mockRouter({
  routeParams: { _id: '1' },
  routeMatch: { url: '/playlist/1' }
});

import { PlaylistContainer } from './PlaylistContainer';

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
    allById: {}
  },
  covers: {
    allById: {}
  },
  waveforms: {
    allById: {}
  }
};

describe('PlaylistContainer', () => {
  it('should contain a .playlist-view', () => {
    const wrapper = renderInAll(<PlaylistContainer/>, defaultStore);
    expect(wrapper.is('.playlist-view')).toBe(true);
  });  
});
