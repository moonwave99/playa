import React from 'react';
import { renderInAll } from '../../../../test/testUtils';
import { albums, artists } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
import { CompactAlbumListView } from './CompactAlbumListView';

const defaultStore = {
  player: {
    queue: [] as string[]
  },
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
  }
};

describe('CompactAlbumListView', () => {
  it('should render a .compact-album-list', () => {
    const wrapper = renderInAll(
      <CompactAlbumListView
        currentAlbumId={null}
        albums={albums}
        onSelectionChange={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.is('.compact-album-list')).toBe(true);
  });
});
