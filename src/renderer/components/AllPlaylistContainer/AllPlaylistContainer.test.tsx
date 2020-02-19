import * as React from 'react';
import { renderInAll } from '../../../../test/testUtils';
import { playlists, albums } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';

import { AllPlaylistContainer } from './AllPlaylistContainer';

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

describe('AllPlaylistContainer', () => {
  it('should contain a .all-playlists-view', () => {
    const wrapper = renderInAll(
      <AllPlaylistContainer playlists={playlists}/>
      , defaultStore);
    expect(wrapper.is('.all-playlists-view')).toBe(true);
  });
});
