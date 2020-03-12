import React from 'react';
import { renderInAll, mountInAll, mockRouter } from '../../../../../test/testUtils';

mockRouter({
  location: { pathname: '/library', search: '' }
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
        onAddAlbumButtonClick={jest.fn()}
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
        onAddAlbumButtonClick={jest.fn()}
        onQueueButtonDrop={jest.fn()}/>
		);
		expect(wrapper.find('h1')).toHaveLength(1);
  });

  it('should call the onAddAlbumButtonClick when the button is clicked', () => {
    const handler = jest.fn();
		const wrapper = mountInAll(
			<AppHeader
        title="Playa"
        hasSearchFocus={false}
        onSearchFormSubmit={jest.fn()}
        onSearchFormBlur={jest.fn()}
        onAddAlbumButtonClick={handler}
        onQueueButtonDrop={jest.fn()}/>
		);
		wrapper.find('.button-add-album').simulate('click');
    expect(handler).toHaveBeenCalled();
  });

  it('should highlight the library button when location = /library', () => {
    const wrapper = renderInAll(
			<AppHeader
        title="Playa"
        hasSearchFocus={false}
        onSearchFormSubmit={jest.fn()}
        onSearchFormBlur={jest.fn()}
        onAddAlbumButtonClick={jest.fn()}
        onQueueButtonDrop={jest.fn()}/>
		);
    expect(wrapper.find('.button-library').is(':not(.button-outline)')).toBe(true);
  });
});
