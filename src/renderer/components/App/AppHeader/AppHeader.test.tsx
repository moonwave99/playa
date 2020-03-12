import React from 'react';
import { render, mountInAll } from '../../../../../test/testUtils';

import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('should render a .app-header', () => {
		const wrapper = render(
			<AppHeader
				title="Playa"
        onAddAlbumButtonClick={jest.fn()}
			/>
		);
		expect(wrapper.is('.app-header')).toBe(true);
  });

	it('should contain a title', () => {
		const wrapper = render(
			<AppHeader
				title="Playa"
        onAddAlbumButtonClick={jest.fn()}
			/>
		);
		expect(wrapper.find('h1')).toHaveLength(1);
  });

  it('should call the onAddAlbumButtonClick when the button is clicked', () => {
    const handler = jest.fn();
		const wrapper = mountInAll(
			<AppHeader
				title="Playa"
        onAddAlbumButtonClick={handler}
			/>
		);
		wrapper.find('.button-add-album').simulate('click');
    expect(handler).toHaveBeenCalled();
  });
});
