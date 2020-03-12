import React from 'react';
import { renderInAll, mockRouter } from '../../../../test/testUtils';
import { playlists } from '../../../../test/testFixtures';

mockRouter({
  location: { pathname: '/library', search: '' }
});

import { SidebarView } from './SidebarView';

describe('SidebarView', () => {
  it('should render a .sidebar', () => {
		const wrapper = renderInAll(
			<SidebarView
				recentPlaylists={playlists}
				currentPlaylistId={null}
				onCreatePlaylist={jest.fn()}/>
		);
		expect(wrapper.is('.sidebar')).toBe(true);
  });
});
