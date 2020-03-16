import React from 'react';
import { renderInAll, mountInAll, mockRouter } from '../../../../test/testUtils';
import { artists } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
import { Album } from '../../store/modules/album';

mockRouter({
  routeParams: { _id: 'Slowdive' },
  routeMatch: { url: '/artist/Slowdive' }
});

import { ArtistView } from './ArtistView';

const defaultStore = {
  player: {
    currentAlbumId: null as Album['_id']
  },
  albums: {
    allById: {}
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

  it('should update page title', () => {
    mountInAll(
      <ArtistView/>
    , defaultStore);
    expect(document.title).toBe('Artist: Slowdive');
  });
});
