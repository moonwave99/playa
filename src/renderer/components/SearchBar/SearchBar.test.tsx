import * as React from 'react';
import { render, mount } from 'enzyme';

import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('should render a .search-bar', () => {
    const wrapper = render(
      <SearchBar onFormSubmit={jest.fn()} onBlur={jest.fn()} />
    );
    expect(wrapper.is('.search-bar')).toBe(true);
  });

	it('should be .has-fous if hasFocus = true', () => {
		const wrapper = render(
      <SearchBar onFormSubmit={jest.fn()} onBlur={jest.fn()} hasFocus/>
    );
    expect(wrapper.is('.has-focus')).toBe(true);
	});

	it('should set the focus to the input field if hasFocus = true', () => {
		const wrapper = mount(
			<SearchBar onFormSubmit={jest.fn()} onBlur={jest.fn()} hasFocus/>
		);
		const input = wrapper.find('.search-input');
		expect(input.instance()).toEqual(document.activeElement);
	});

	it('should call the onFormSubmit handler when form is submit', () => {
		const handler = jest.fn();
		const wrapper = mount(
      <SearchBar onFormSubmit={handler} onBlur={jest.fn()}/>
    );
		wrapper.find('form').simulate('submit');
		expect(handler).toHaveBeenCalled();
	});

	it('should call the onBlur handler when the input loses focus', () => {
		const handler = jest.fn();
		const wrapper = mount(
      <SearchBar onFormSubmit={jest.fn()} onBlur={handler}/>
    );
		wrapper.find('.search-input').simulate('blur');
		expect(handler).toHaveBeenCalled();
	});
});
