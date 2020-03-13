import React from 'react';
import { renderInAll, mountInAll, mockRouter } from '../../../../../../test/testUtils';
import { toObj } from '../../../../utils/storeUtils';
import { playlists } from '../../../../../../test/testFixtures';

mockRouter({
  routeParams: { _id: '1' },
  routeMatch: { url: '/playlist/1' }
});

import { PlaylistTitle } from './PlaylistTitle';

describe('PlaylistTitle', () => {
  const defaultStore = {
    playlists: {
      allById: toObj(playlists)
    }
  };
  it('should contain a title', () => {
    const wrapper = renderInAll(
			<PlaylistTitle/>
		, defaultStore);
    expect(wrapper.is('h1.playlist-title')).toBe(true);
    expect(wrapper.text()).toEqual(playlists[0].title);
  });

	it('should display a form when title is clicked', () => {
		const wrapper = mountInAll(
			<PlaylistTitle/>
		, defaultStore);
		wrapper.simulate('click');
		expect(wrapper.find('form')).toHaveLength(1);
	});
});
