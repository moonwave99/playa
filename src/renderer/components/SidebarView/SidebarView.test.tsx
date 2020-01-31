import * as React from 'react';
import { renderInAll, mockRouter } from '../../../../test/testUtils';
import { playlists } from '../../../../test/testFixtures';

mockRouter({
  location: { pathname: '/library' }
});

import { SidebarView } from './SidebarView';

describe('SidebarView tests', () => {
  it('should render a .sidebar', () => {
		const wrapper = renderInAll(
			<SidebarView
				hasSearchFocus={false}
				recentPlaylists={playlists}
				currentPlaylistId={null}
				onCreatePlaylist={jest.fn()}
				onSearchBarBlur={jest.fn()}
				onSearchFormSubmit={jest.fn()}
			/>
		);
		expect(wrapper.is('.sidebar')).toBe(true);
  });

	it('should highlight the library button when location = /library', () => {
		const wrapper = renderInAll(
			<SidebarView
				hasSearchFocus={false}
				recentPlaylists={playlists}
				currentPlaylistId={null}
				onCreatePlaylist={jest.fn()}
				onSearchBarBlur={jest.fn()}
				onSearchFormSubmit={jest.fn()}
			/>
		);
		expect(wrapper.find('.button-library').is(':not(.button-outline)')).toBe(true);
  });
});
