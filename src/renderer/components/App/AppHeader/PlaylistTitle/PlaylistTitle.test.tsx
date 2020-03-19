import React from 'react';
import { renderInAll, mockRouter } from '../../../../../../test/testUtils';
import { toObj } from '../../../../utils/storeUtils';
import { playlists } from '../../../../../../test/testFixtures';

mockRouter({
  routeParams: { _id: '1' },
  routeMatch: { url: '/playlist/1' }
});

import { PlaylistTitle } from './PlaylistTitle';

describe('PlaylistTitle', () => {
  it('should contain a title', () => {
    const defaultStore = {
      playlists: {
        allById: toObj(playlists)
      },
      ui: {
        editPlaylistTitle: false
      }
    };
    const wrapper = renderInAll(
			<PlaylistTitle/>
		, defaultStore);
    expect(wrapper.is('h1.playlist-title')).toBe(true);
    expect(wrapper.text()).toEqual(playlists[0].title);
  });

	it('should display a form when editPlaylistTitle in store = true', () => {
    const defaultStore = {
      playlists: {
        allById: toObj(playlists)
      },
      ui: {
        editPlaylistTitle: true
      }
    };
		const wrapper = renderInAll(
			<PlaylistTitle/>
		, defaultStore);
		expect(wrapper.is('form.playlist-title-form')).toBe(true);
	});
});
