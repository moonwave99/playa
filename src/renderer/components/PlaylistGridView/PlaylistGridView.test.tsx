import React from 'react';
import { renderInAll } from '../../../../test/testUtils';
import { playlists } from '../../../../test/testFixtures';

import { PlaylistGridView } from './PlaylistGridView';

const defaultStore = {
  player: {
    queue: [] as string[]
  },
  playlists: {
    allById: {}
  },
  albums: {
    allById: {}
  },
  tracks: {
    allById: {}
  },
  waveforms: {
    allById: {}
  }
};

describe('PlaylistGridView', () => {
  it('should render a .playlist-grid', () => {
    const wrapper = renderInAll(
      <PlaylistGridView
        playlists={playlists}
        currentPlaylistId={null}
        onPlaylistDelete={jest.fn()}
        onPlaylistContextMenu={jest.fn()}
        onSelectionChange={jest.fn()}/>
      , defaultStore);
    expect(wrapper.is('.playlist-grid')).toBe(true);
  });
});
