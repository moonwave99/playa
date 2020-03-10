import * as React from 'react';
import { renderInAll, mountInAll, mockRouter } from '../../../../test/testUtils';
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
    allById: toObj([
      {
        ...playlists[0],
        _rev: '1'
      },
      playlists[1]
    ])
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

  it('should update page title with playlist info', () => {
    mountInAll(<PlaylistContainer/>, defaultStore);
    expect(document.title).toBe(`Playlist: ${playlists[0].title}`);
  });
});
