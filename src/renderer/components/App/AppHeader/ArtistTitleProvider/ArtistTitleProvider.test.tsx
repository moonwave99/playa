import React from 'react';
import { mountInAll, mockRouter } from '../../../../../../test/testUtils';
import { artists } from '../../../../../../test/testFixtures';
import { toObj } from '../../../../utils/storeUtils';

mockRouter({
  routeParams: { _id: '1' },
  routeMatch: { url: '/artists/1' }
});

import { ArtistTitleProvider } from './ArtistTitleProvider';

const defaultStore = {
  artists: {
    allById: toObj(artists)
  },
	ui: {
		editArtistTitle: false
	}
};

describe('ArtistTitleProvider', () => {
  it('should contain a .playlist-title', () => {
    const wrapper = mountInAll(<ArtistTitleProvider/>, defaultStore);
    expect(wrapper.find('h1.artist-title')).toHaveLength(1);
		expect(wrapper.find('.heading-main').text()).toBe(artists[0].name);
  });

  it('should contain a form if editPlaylistTitle is true', () => {
    const wrapper = mountInAll(<ArtistTitleProvider/>, {
			...defaultStore,
			ui: {
				editArtistTitle: true
			}
		});
    expect(wrapper.find('form.artist-title')).toHaveLength(1);
  });
});
