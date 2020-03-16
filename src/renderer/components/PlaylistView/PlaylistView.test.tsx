import React from 'react';
import { renderInAll, mountInAll } from '../../../../test/testUtils';
import { playlists, albums, artists } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
import { formatDate } from '../../utils/datetimeUtils';

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
  covers: {
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
        onAlbumOrderChange={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}
        />
      , defaultStore);
    expect(wrapper.is('.playlist-view')).toBe(true);
  });

  it('should render the playlist creation date', () => {
    const wrapper = renderInAll(
      <PlaylistView
        playlist={playlists[0]}
        currentTrackId={null}
        currentAlbumId={null}
        albums={toObj(albums)}
        onAlbumOrderChange={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}
        />
      , defaultStore);
    expect(wrapper.find('.playlist-info-created-on').text())
      .toEqual(`Created on ${formatDate({
        date: playlists[0].created,
        options: { year: 'numeric', month: 'long', day: 'numeric' }
      })}`);
  });

  it('should toggle album view mode when clicking the .toggle-view-button', async () => {
    const wrapper = mountInAll(
      <PlaylistView
        playlist={playlists[0]}
        currentTrackId={null}
        currentAlbumId={null}
        albums={toObj(albums)}
        onAlbumOrderChange={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}
        />
      , defaultStore);

    const button = wrapper.find('.playlist-toggle-view-button');
    button.simulate('click');
    expect(button.is('.extended')).toBe(true);
  });

  it('should render a .playlist-empty-placeholder if playlist is empty', () => {
    const wrapper = renderInAll(
      <PlaylistView
        playlist={playlists[0]}
        currentTrackId={null}
        currentAlbumId={null}
        albums={toObj(albums)}
        onAlbumOrderChange={jest.fn()}
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
        onAlbumOrderChange={jest.fn()}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}
        />
      , defaultStore);
    expect(wrapper.find('.album-list')).toHaveLength(1);
  });
});
