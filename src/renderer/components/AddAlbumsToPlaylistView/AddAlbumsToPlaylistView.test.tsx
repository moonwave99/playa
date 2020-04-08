import React from 'react';
import { renderInAll } from '../../../../test/testUtils';
import { albums } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';

import { AddAlbumsToPlaylistView } from './AddAlbumsToPlaylistView';

const defaultStore = {
  playlists: {
    allById: {}
  },
  albums: {
    allById: toObj(albums)
  }
};

describe('AddAlbumsToPlaylistView', () => {
  it('should render a .add-albums-to-playlist', () => {
		const wrapper = renderInAll(
			<AddAlbumsToPlaylistView
        albumIDs={[]}
        onPlaylistClick={jest.fn()}/>
		, defaultStore);
		expect(wrapper.is('.add-albums-to-playlist')).toBe(true);
  });
});
