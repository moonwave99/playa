import React from 'react';
import { renderInAll } from '../../../../../test/testUtils';
import { albums, artists } from '../../../../../test/testFixtures';
import { toObj } from '../../../utils/storeUtils';
import { LatestAlbumsView } from './LatestAlbumsView';

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

describe('LatestAlbumsView', () => {
  it('should render an .library-latest-albums', () => {
    const wrapper = renderInAll(
      <LatestAlbumsView
        albums={albums}
        currentAlbumId={null}
        currentTrackId={null}
        onAlbumEnter={jest.fn()}
        onAlbumBackspace={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    , defaultStore);
    expect(wrapper.is('.library-latest-albums')).toBe(true);
  });

  it('should render an .album-grid', () => {
    const wrapper = renderInAll(
      <LatestAlbumsView
        albums={albums}
        currentAlbumId={null}
        currentTrackId={null}
        onAlbumEnter={jest.fn()}
        onAlbumBackspace={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.album-grid')).toHaveLength(1);
  });

  it('should render a .library-latest-albums-empty-placeholder if there are no albums', () => {
    const wrapper = renderInAll(
      <LatestAlbumsView
        albums={[]}
        currentAlbumId={null}
        currentTrackId={null}
        onAlbumEnter={jest.fn()}
        onAlbumBackspace={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.album-grid')).toHaveLength(0);
    expect(wrapper.find('.library-latest-albums-empty-placeholder')).toHaveLength(1);
  });
});
