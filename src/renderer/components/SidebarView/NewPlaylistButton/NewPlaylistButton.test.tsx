import * as React from 'react';
import { renderInDnDProvider, mountInDnDProvider } from '../../../../../test/testUtils';

import { NewPlaylistButton } from './NewPlaylistButton';

describe('NewPlaylistButton', () => {
  it('should render a .new-playlist-button', () => {
		const wrapper = renderInDnDProvider(
			<NewPlaylistButton
        onClick={jest.fn()}
        onDrop={jest.fn()}
			/>
		);
		expect(wrapper.is('.new-playlist-button')).toBe(true);
  });

  it('should call the onClick handler when clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInDnDProvider(
      <NewPlaylistButton
        onClick={handler}
        onDrop={jest.fn()}
			/>
    );
    wrapper.find('button').simulate('click');
    expect(handler).toHaveBeenCalled();
  });
});
