import React from 'react';
import { renderInAll, mountInAll, simulateKey } from '../../../../../test/testUtils';
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
    const wrapper = mountInAll(
      <AlbumGridView
        albums={albums}
        currentAlbumId={null}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    , defaultStore);

    expect(wrapper.find('.album-grid-tile')).toHaveLength(albums.length);
    wrapper.unmount();
  });

  it('should update selection', () => {
    const wrapper = mountInAll(
      <AlbumGridView
        albums={albums}
        currentAlbumId={null}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    , defaultStore);

    wrapper.find('.album-grid-tile .album-cover').at(0).simulate('click');
    expect(wrapper.find('.selected')).toHaveLength(1);

    wrapper.find('.album-grid-tile .album-cover').at(0).simulate('click', { metaKey: true });
    expect(wrapper.find('.selected')).toHaveLength(0);
  });

  it('should call the onEnter handler when enter is pressed', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <AlbumGridView
        albums={albums}
        currentAlbumId={null}
        onEnter={handler}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    , defaultStore);

    wrapper.find('.album-grid-tile .album-cover').at(0).simulate('click');

    simulateKey({ eventType: 'keydown', key: 'Enter' });

    expect(handler).toHaveBeenCalledWith(['1']);
  });

  it('should call the onBackspace handler when backspace is pressed', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <AlbumGridView
        albums={albums}
        currentAlbumId={null}
        onBackspace={handler}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    , defaultStore);

    wrapper.find('.album-grid-tile .album-cover').at(0).simulate('click');

    simulateKey({ eventType: 'keydown', key: 'Backspace' });

    expect(handler).toHaveBeenCalledWith(['1']);
  });
});
