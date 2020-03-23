import React from 'react';
import { renderInAll } from '../../../../../test/testUtils';
import { playlists, albums, artists } from '../../../../../test/testFixtures';
import { toObj } from '../../../utils/storeUtils';
import { EditAlbumView } from './EditAlbumView';

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


describe('EditAlbumView', () => {
  it('should render an .edit-album', () => {
    const wrapper = renderInAll(
      <EditAlbumView
        album={albums[0]}
        onFormSubmit={jest.fn()}/>
    , defaultStore);
    expect(wrapper.is('.edit-album')).toBe(true);
  });

  it('should contain a title with the folder name', () => {
    const wrapper = renderInAll(
      <EditAlbumView
        album={albums[0]}
        onFormSubmit={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('code').text()).toBe('/path/to/album_1');
  });

  it('should contain an .album-form', () => {
    const wrapper = renderInAll(
      <EditAlbumView
        album={albums[0]}
        onFormSubmit={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.album-form')).toHaveLength(1);
  });
});
