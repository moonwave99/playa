import React from 'react';
import { renderInAll } from '../../../../test/testUtils';
import { albums, artists } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
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

describe('AlbumListView', () => {
  it('should render an .album-list', () => {
    const wrapper = renderInAll(
      <AlbumListView
        currentAlbumId={null}
        currentTrackId={null}
        originalOrder={albums.map(({ _id }) => _id)}
        dragType=''
        albums={toObj(albums)}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.is('.album-list')).toBe(true);
  });
});
