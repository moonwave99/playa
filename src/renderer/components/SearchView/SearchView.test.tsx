import * as React from 'react';
import { renderInAll, mockRouter } from '../../../../test/testUtils';
import { albums } from '../../../../test/testFixtures';

mockRouter({
  location: { pathname: '/search', search: 'query=slowdive' }
});

import { SearchView } from './SearchView';

describe('SearchView', () => {
  it('should render a .search-view', () => {
    const store = {
      search: {},
      player: {}
    };
		const wrapper = renderInAll(<SearchView/>, store);
		expect(wrapper.is('.search-view')).toBe(true);
  });

  it('should contain a title', () => {
    const store = {
      search: {},
      player: {}
    };
		const wrapper = renderInAll(<SearchView/>, store);
		expect(wrapper.find('h1')).toHaveLength(1);
  });

  it('should contain a .search-result-list', () => {
    const store = {
      search: {
        results: albums
      },
      covers: {
        allById: {}
      },
      player: {}
    };
		const wrapper = renderInAll(<SearchView/>, store);
		expect(wrapper.find('.search-result-list'))
      .toHaveLength(1);
  });

  it('should render no children if isSearching', () => {
    const store = {
      search: {
        isSearching: true
      },
      player: {}
    };
		const wrapper = renderInAll(<SearchView/>, store);
		expect(wrapper.find('.search-result-list'))
      .toHaveLength(0);
  });
});
