import * as React from 'react';
import { mountInAll } from '../../../../test/testUtils';
import { albums, artists } from '../../../../test/testFixtures';
import { LibraryView } from './LibraryView';
import { Album } from '../../store/modules/album';
import { toObj } from '../../utils/storeUtils';

const defaultStore = {
  player: {
    queue: [] as string[],
    currentAlbumId: null as Album['_id']
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
  },
  library: {
    latest: albums.map(({ _id }) => _id),
    latestAlbumId: albums[1]._id,
    artistsById: toObj(artists)
  }
};

describe('LibraryView', () => {
  it('should render a .library', () => {
    const wrapper = mountInAll(
      <LibraryView/>
    , defaultStore);
    expect(wrapper.find('.library')).toHaveLength(1);
  });

  it('should contain a title', () => {
    const wrapper = mountInAll(
      <LibraryView/>
    , defaultStore);
    expect(wrapper.find('h1')).toHaveLength(1);
  });

  it('should contain a .button-add-album', () => {
    const wrapper = mountInAll(
      <LibraryView/>
    , defaultStore);
    expect(wrapper.find('.button-add-album')).toHaveLength(1);
  });

  it('should contain a .library-artists', () => {
    const wrapper = mountInAll(
      <LibraryView/>
    , defaultStore);
    expect(wrapper.find('.button-add-album')).toHaveLength(1);
  });

  it('should contain an .library-latest-albums', () => {
    const wrapper = mountInAll(
      <LibraryView/>
    , defaultStore);
    expect(wrapper.find('.album-grid')).toHaveLength(1);
  });

  it('should update page title', () => {
    mountInAll(
      <LibraryView/>
    , defaultStore);
    expect(document.title).toBe('Library');
  });
});
