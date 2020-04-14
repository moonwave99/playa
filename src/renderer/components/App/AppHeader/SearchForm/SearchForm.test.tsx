import React from 'react';
import { renderInAll, mountInAll } from '../../../../../../test/testUtils';

import { SearchForm } from './SearchForm';

const defaultStore = {
  artists: {
    allById: {}
  }
};

describe('SearchForm', () => {
  it('should render a .search-form', () => {
    const wrapper = renderInAll(
      <SearchForm onFormSubmit={jest.fn()} onBlur={jest.fn()} />
    , defaultStore);
    expect(wrapper.is('.search-form')).toBe(true);
  });

	it('should be .has-focus if requestFocus = true', () => {
		const wrapper = renderInAll(
      <SearchForm onFormSubmit={jest.fn()} onBlur={jest.fn()} requestFocus/>
    , defaultStore);
    expect(wrapper.is('.has-focus')).toBe(true);
	});

	it('should set the focus to the input field if requestFocus = true', () => {
		const wrapper = mountInAll(
			<SearchForm onFormSubmit={jest.fn()} onBlur={jest.fn()} requestFocus/>
		, defaultStore);
		const input = wrapper.find('.search-input');
		expect(input.instance()).toEqual(document.activeElement);
	});

	it('should call the onFormSubmit handler when form is submit', () => {
		const handler = jest.fn();
		const wrapper = mountInAll(
      <SearchForm onFormSubmit={handler} onBlur={jest.fn()}/>
    , defaultStore);
		wrapper.find('form').simulate('submit');
		expect(handler).toHaveBeenCalled();
	});

	it('should call the onBlur handler when the input loses focus', () => {
		const handler = jest.fn();
		const wrapper = mountInAll(
      <SearchForm onFormSubmit={jest.fn()} onBlur={handler}/>
    , defaultStore);
		wrapper.find('.search-input').simulate('blur');
		expect(handler).toHaveBeenCalled();
	});
});
