import React from 'react';
import { renderInAll, mockRouter } from '../../../../../../test/testUtils';
import { toObj } from '../../../../utils/storeUtils';
import { playlists } from '../../../../../../test/testFixtures';
import { formatDate } from '../../../../utils/datetimeUtils';

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
    expect(wrapper.is('h1.playlist-header')).toBe(true);
    expect(wrapper.find('.heading-main').text()).toEqual(playlists[0].title);
  });

  it('should contain the playlist date', () => {
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
    expect(wrapper.find('.heading-sub').text())
      .toEqual(`Created on ${formatDate({
        date: playlists[0].created,
        options: { year: 'numeric', month: 'long', day: 'numeric' }
      })}`);
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
