import React from 'react';
import { mountInAll, mockRouter } from '../../../../../../test/testUtils';
import { playlists } from '../../../../../../test/testFixtures';
import { toObj } from '../../../../utils/storeUtils';

mockRouter({
  routeParams: { _id: '1' },
  routeMatch: { url: '/playlist/1' }
});

import { PlaylistTitleProvider } from './PlaylistTitleProvider';

const defaultStore = {
  playlists: {
    allById: toObj([
      {
        ...playlists[0],
        _rev: '1'
      },
      playlists[1]
    ])
  },
	ui: {
		editPlaylistTitle: false
	}
};

describe('PlaylistTitleProvider', () => {
  it('should contain a .playlist-title', () => {
    const wrapper = mountInAll(<PlaylistTitleProvider/>, defaultStore);
    expect(wrapper.find('h1.playlist-title')).toHaveLength(1);
		expect(wrapper.find('.heading-main').text()).toBe(playlists[0].title);
  });

  it('should contain a form if editPlaylistTitle is true', () => {
    const wrapper = mountInAll(<PlaylistTitleProvider/>, {
			...defaultStore,
			ui: {
				editPlaylistTitle: true
			}
		});
    expect(wrapper.find('form.playlist-title')).toHaveLength(1);
  });
});
