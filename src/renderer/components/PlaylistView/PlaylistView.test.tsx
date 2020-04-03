import React from 'react';
import { renderInAll } from '../../../../test/testUtils';
import { playlists, albums, artists } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';

import { PlaylistView } from './PlaylistView';

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

describe('PlaylistView', () => {
  it('should render a .playlist-view', () => {
    const wrapper = renderInAll(
      <PlaylistView
        playlist={playlists[0]}
        currentTrackId={null}
        currentAlbumId={null}
        albums={toObj(albums)}
        onSelectionChange={jest.fn()}
        onAlbumOrderChange={jest.fn()}
        onAlbumEnter={jest.fn()}
        onAlbumBackspace={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}
        />
      , defaultStore);
    expect(wrapper.is('.playlist-view')).toBe(true);
  });

  it('should render a .playlist-empty-placeholder if playlist is empty', () => {
    const wrapper = renderInAll(
      <PlaylistView
        playlist={playlists[0]}
        currentTrackId={null}
        currentAlbumId={null}
        albums={toObj(albums)}
        onSelectionChange={jest.fn()}
        onAlbumOrderChange={jest.fn()}
        onAlbumEnter={jest.fn()}
        onAlbumBackspace={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}
        />
      , defaultStore);
    expect(wrapper.find('.playlist-empty-placeholder')).toHaveLength(1);
  });

  it('should render a .album-list if playlist has any albums', () => {
    const playlist = {
      ...playlists[0],
      albums: ['1', '2']
    }
    const wrapper = renderInAll(
      <PlaylistView
        playlist={playlist}
        currentTrackId={null}
        currentAlbumId={null}
        albums={toObj(albums)}
        onSelectionChange={jest.fn()}
        onAlbumOrderChange={jest.fn()}
        onAlbumEnter={jest.fn()}
        onAlbumBackspace={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}
        />
      , defaultStore);
    expect(wrapper.find('.compact-album-list')).toHaveLength(1);
  });
});
