import React from 'react';
import { mountInAll } from '../../../../test/testUtils';
import { albums, artists } from '../../../../test/testFixtures';
import { LibraryView } from './LibraryView';
import { Album } from '../../store/modules/album';
import { UILibraryView } from '../../store/modules/ui';
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
  artists: {
    allById: toObj(artists)
  },
  tracks: {
    allById: {}
  },
  artistPictures: {
    allById: {}
  },
  waveforms: {
    allById: {}
  },
  library: {
    latest: albums.map(({ _id }) => _id)
  },
  ui: {
    libraryView: UILibraryView.Timeline
  }
};

describe('LibraryView', () => {
  it('should render a .library', () => {
    const wrapper = mountInAll(
      <LibraryView onDrop={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.library')).toHaveLength(1);
  });

  it('should contain an .library-latest-albums', () => {
    const wrapper = mountInAll(
      <LibraryView onDrop={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.album-grid')).toHaveLength(1);
  });

  it('should update page title', () => {
    mountInAll(
      <LibraryView onDrop={jest.fn()}/>
    , defaultStore);
    expect(document.title).toBe('Library');
  });

  describe('if libraryView is Artists', () => {
    it('should contain an .artist-list', () => {
      const wrapper = mountInAll(
        <LibraryView onDrop={jest.fn()}/>
      , {
          ...defaultStore,
          library: {
            latest: []
          },
          ui: {
            libraryView: UILibraryView.Artists
          }
        });
      expect(wrapper.find('.artist-list')).toHaveLength(1);
    });

    it('should select letter on alphabet letter click', () => {
      const wrapper = mountInAll(
        <LibraryView onDrop={jest.fn()}/>
      , {
          ...defaultStore,
          library: {
            latest: []
          },
          ui: {
            libraryView: UILibraryView.Artists
          }
        });
      wrapper
        .find('.alphabet .letter-s a')
        .simulate('click');

      expect(wrapper.find('.alphabet .letter-s').is('.selected')).toBe(true);
    });
  });
});
