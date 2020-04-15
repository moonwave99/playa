import React from 'react';
import { renderInAll } from '../../../../../test/testUtils';
import { albums, artists } from '../../../../../test/testFixtures';
import { toObj } from '../../../utils/storeUtils';
import { AlbumTypes } from '../../../store/modules/album';
import { AlbumForm } from './AlbumForm';

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

describe('AlbumForm', () => {
  it('should render an .album-form', () => {
    const wrapper = renderInAll(
      <AlbumForm
        album={albums[0]}
        albumType={AlbumTypes.Album}
        isAlbumFromVA={albums[0].isAlbumFromVA}
        onFormSubmit={jest.fn()}/>
    , defaultStore);

    expect(wrapper.is('.album-form')).toBe(true);
  });
});
