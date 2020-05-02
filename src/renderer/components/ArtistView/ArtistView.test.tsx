import React from 'react';
import { renderInAll, mountInAll, mockRouter } from '../../../../test/testUtils';
import { artists, albums } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
import { Album } from '../../store/modules/album';

const router = mockRouter({
  routeParams: { _id: '1' },
  routeMatch: { url: '/artist/1' }
});

import { ArtistView } from './ArtistView';

const defaultStore = {
  player: {
    currentAlbumId: null as Album['_id']
  },
  albums: {
    allById: toObj(albums)
  },
  artists: {
    allById: toObj(artists)
  }
};

describe('ArtistView', () => {
  it('should render a .artist', () => {
		const wrapper = renderInAll(
			<ArtistView/>
		, defaultStore);
		expect(wrapper.is('.artist')).toBe(true);
  });

  it('should render not render a .artist if artist is not found', () => {
    router.routeParams = { _id: '666' }
		const wrapper = renderInAll(
			<ArtistView/>
		, defaultStore);
		expect(wrapper.is('.artist')).toBe(false);
  });

  it('should render an .artist-empty-placeholder if artist has no releases', () => {
    router.routeParams = { _id: '1' }
    const wrapper = renderInAll(
			<ArtistView/>
		, {
      ...defaultStore,
      albums: {
        allById: {}
      }
    });
    expect(wrapper.find('.artist-empty-placeholder')).toHaveLength(1);
  });

  it('should update page title', () => {
    mountInAll(
      <ArtistView/>
    , defaultStore);
    expect(document.title).toBe('Slowdive');
  });
});
