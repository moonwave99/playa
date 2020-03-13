import React from 'react';
import { renderInAll } from '../../../../test/testUtils';
import { albums } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
import { UIAlbumView } from '../../store/modules/ui';
import { AlbumListView } from './AlbumListView';

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

describe('AlbumListView', () => {
  it('should render an .album-list', () => {
    const wrapper = renderInAll(
      <AlbumListView
        currentAlbumId={null}
        currentTrackId={null}
        originalOrder={albums.map(({ _id }) => _id)}
        dragType=''
        albumView={UIAlbumView.Extended}
        albums={toObj(albums)}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.is('.album-list')).toBe(true);
  });

  it('should render a list of .album-view if albumView is Extended', () => {
    const wrapper = renderInAll(
      <AlbumListView
        currentAlbumId={null}
        currentTrackId={null}
        originalOrder={albums.map(({ _id }) => _id)}
        dragType=''
        albumView={UIAlbumView.Extended}
        albums={toObj(albums)}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.find('.album-view')).toHaveLength(albums.length);
  });

  it('should render a list of .compact-album-view if albumView is Extended', () => {
    const wrapper = renderInAll(
      <AlbumListView
        currentAlbumId={null}
        currentTrackId={null}
        originalOrder={albums.map(({ _id }) => _id)}
        dragType=''
        albumView={UIAlbumView.Compact}
        albums={toObj(albums)}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.find('.compact-album-view')).toHaveLength(albums.length);
  });
});
