import React from 'react';
import { render, mount } from 'enzyme';
import { playlists } from '../../../../../test/testFixtures';

import { PlaylistViewTitle } from './PlaylistViewTitle';

describe('PlaylistViewTitle', () => {
  it('should contain a title', () => {
    const wrapper = render(
			<PlaylistViewTitle
				playlist={playlists[0]}
				onTitleChange={jest.fn()}/>
		);
    expect(wrapper.is('h1.playlist-title')).toBe(true);
    expect(wrapper.text()).toEqual(playlists[0].title);
  });

	it('should display a form when title is clicked', () => {
		const wrapper = mount(
			<PlaylistViewTitle
				playlist={playlists[0]}
				onTitleChange={jest.fn()}/>
		);
		wrapper.simulate('click');
		expect(wrapper.find('form')).toHaveLength(1);
	});

	it('should call the onTitleChange handler when the input loses focus', () => {
		const handler = jest.fn();
		const wrapper = mount(
			<PlaylistViewTitle
				playlist={playlists[0]}
				onTitleChange={handler}/>
		);
		wrapper.simulate('click');
		const input = wrapper.find('input');
		const node = input.getDOMNode() as HTMLInputElement;
		const newTitle = 'best of gangsta gaze';
		node.value = newTitle;
		input.simulate('change');
		wrapper.simulate('submit');
		expect(handler).toHaveBeenCalledWith(newTitle);
	});

	it('should display the title after Esc keypress in the form', () => {
		const handler = jest.fn();
		const wrapper = mount(
			<PlaylistViewTitle
				playlist={playlists[0]}
				onTitleChange={handler}/>
		);
		wrapper.simulate('click');
		wrapper.find('input').simulate('keydown', {
			key: 'Escape'
		});
		expect(wrapper.find('.playlist-title')).toHaveLength(1);
	});
});
