import React from 'react';
import { renderInAll } from '../../../../../test/testUtils';
import { albums, artists } from '../../../../../test/testFixtures';
import { toObj } from '../../../utils/storeUtils';
import { AlbumGridView } from './AlbumGridView';

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

describe('AlbumGridView', () => {
  it('should render an .album-grid', () => {
    const wrapper = renderInAll(
      <AlbumGridView
        albums={albums}
        currentAlbumId={null}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    , defaultStore);
    expect(wrapper.is('.album-grid')).toBe(true);
  });

  it('should render n=albums.length .album-grid-tile', () => {
    const wrapper = renderInAll(
      <AlbumGridView
        albums={albums}
        currentAlbumId={null}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.album-grid-tile')).toHaveLength(albums.length);
  });
});
