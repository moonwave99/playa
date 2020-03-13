import React from 'react';
import { render, mount } from '../../../../../../test/testUtils';

import { SearchForm } from './SearchForm';

describe('SearchForm', () => {
  it('should render a .search-form', () => {
    const wrapper = render(
      <SearchForm onFormSubmit={jest.fn()} onBlur={jest.fn()} />
    );
    expect(wrapper.is('.search-form')).toBe(true);
  });

	it('should be .has-fous if hasFocus = true', () => {
		const wrapper = render(
      <SearchForm onFormSubmit={jest.fn()} onBlur={jest.fn()} hasFocus/>
    );
    expect(wrapper.is('.has-focus')).toBe(true);
	});

	it('should set the focus to the input field if hasFocus = true', () => {
		const wrapper = mount(
			<SearchForm onFormSubmit={jest.fn()} onBlur={jest.fn()} hasFocus/>
		);
		const input = wrapper.find('.search-input');
		expect(input.instance()).toEqual(document.activeElement);
	});

	it('should call the onFormSubmit handler when form is submit', () => {
		const handler = jest.fn();
		const wrapper = mount(
      <SearchForm onFormSubmit={handler} onBlur={jest.fn()}/>
    );
		wrapper.find('form').simulate('submit');
		expect(handler).toHaveBeenCalled();
	});

	it('should call the onBlur handler when the input loses focus', () => {
		const handler = jest.fn();
		const wrapper = mount(
      <SearchForm onFormSubmit={jest.fn()} onBlur={handler}/>
    );
		wrapper.find('.search-input').simulate('blur');
		expect(handler).toHaveBeenCalled();
	});
});
