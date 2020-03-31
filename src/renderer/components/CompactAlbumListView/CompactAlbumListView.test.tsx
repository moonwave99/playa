import React from 'react';
import { mountInAll } from '../../../../test/testUtils';
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
    const wrapper = mountInAll(
      <CompactAlbumListView
        currentAlbumId={null}
        albums={albums}
        onSelectionChange={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.find('.compact-album-list')).toHaveLength(1);
  });

  it('should render n=albums.length <li>s', () => {
    let wrapper = mountInAll(
      <CompactAlbumListView
        currentAlbumId={null}
        albums={albums}
        onSelectionChange={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.find('li')).toHaveLength(albums.length);
    wrapper.unmount();

    wrapper = mountInAll(
      <CompactAlbumListView
        currentAlbumId={null}
        albums={[]}
        onSelectionChange={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.find('li')).toHaveLength(0);
  });
});
