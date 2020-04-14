import React from 'react';
import { renderInAll, mockRouter } from '../../../../../test/testUtils';

mockRouter({
  routeMatch: { url: '/library' }
});

const defaultStore = {
  artists: {
    allById: {}
  }
};

import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('should render a .app-header', () => {
		const wrapper = renderInAll(
			<AppHeader
        title={{ main: 'Playa' }}
        requestSearchFocus={false}
        onSearchFormSubmit={jest.fn()}
        onSearchFormBlur={jest.fn()}
        importMusicHandler={jest.fn()}
        libraryViewSwitch={jest.fn()}
        onQueueButtonDrop={jest.fn()}/>
		, defaultStore);
		expect(wrapper.is('.app-header')).toBe(true);
  });

	it('should contain a title', () => {
		const wrapper = renderInAll(
			<AppHeader
        title={{ main: 'Playa' }}
        requestSearchFocus={false}
        onSearchFormSubmit={jest.fn()}
        onSearchFormBlur={jest.fn()}
        importMusicHandler={jest.fn()}
        libraryViewSwitch={jest.fn()}
        onQueueButtonDrop={jest.fn()}/>
		, defaultStore);
		expect(wrapper.find('h1')).toHaveLength(1);
  });

  it('should highlight the library button when location = /library', () => {
    const wrapper = renderInAll(
			<AppHeader
        title={{ main: 'Playa' }}
        requestSearchFocus={false}
        onSearchFormSubmit={jest.fn()}
        onSearchFormBlur={jest.fn()}
        importMusicHandler={jest.fn()}
        libraryViewSwitch={jest.fn()}
        onQueueButtonDrop={jest.fn()}/>
		, defaultStore);
    expect(wrapper.find('.button-library').is(':not(.button-outline)')).toBe(true);
  });
});
