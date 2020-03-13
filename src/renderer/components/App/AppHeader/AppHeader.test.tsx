import React from 'react';
import { renderInAll, mockRouter } from '../../../../../test/testUtils';

mockRouter({
  routeMatch: { url: '/library' }
});

import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('should render a .app-header', () => {
		const wrapper = renderInAll(
			<AppHeader
        title="Playa"
        hasSearchFocus={false}
        onSearchFormSubmit={jest.fn()}
        onSearchFormBlur={jest.fn()}
        onQueueButtonDrop={jest.fn()}/>
		);
		expect(wrapper.is('.app-header')).toBe(true);
  });

	it('should contain a title', () => {
		const wrapper = renderInAll(
			<AppHeader
        title="Playa"
        hasSearchFocus={false}
        onSearchFormSubmit={jest.fn()}
        onSearchFormBlur={jest.fn()}
        onQueueButtonDrop={jest.fn()}/>
		);
		expect(wrapper.find('h1')).toHaveLength(1);
  });

  it('should highlight the library button when location = /library', () => {
    const wrapper = renderInAll(
			<AppHeader
        title="Playa"
        hasSearchFocus={false}
        onSearchFormSubmit={jest.fn()}
        onSearchFormBlur={jest.fn()}
        onQueueButtonDrop={jest.fn()}/>
		);
    expect(wrapper.find('.button-library').is(':not(.button-outline)')).toBe(true);
  });
});
