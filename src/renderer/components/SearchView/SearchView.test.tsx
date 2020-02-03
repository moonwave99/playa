import * as React from 'react';
import { renderInAll, mockRouter } from '../../../../test/testUtils';
import { albums } from '../../../../test/testFixtures';

mockRouter({
  location: { pathname: '/search', search: 'query=slowdive' }
});

import { SearchView } from './SearchView';

describe('SearchView tests', () => {
  it('should render a .search-view', () => {
		const wrapper = renderInAll(<SearchView/>);
		expect(wrapper.is('.search-view')).toBe(true);
  });

  it('should contain a title', () => {
    const store = {
      search: {
        query: 'Slowdive'
      }
    };
		const wrapper = renderInAll(<SearchView/>, store);
		expect(wrapper.find('h1').text())
      .toBe(`Results for: ${store.search.query}`);
  });

  it('should contain a .search-result-list', () => {
    const store = {
      search: {
        query: 'Slowdive',
        results: albums
      },
      covers: {
        allById: {}
      }
    };
		const wrapper = renderInAll(<SearchView/>, store);
		expect(wrapper.find('.search-result-list'))
      .toHaveLength(1);
  });

  it('should render no children if isSearching', () => {
    const store = {
      search: {
        query: 'Slowdive',
        isSearching: true
      }
    };
		const wrapper = renderInAll(<SearchView/>, store);
		expect(wrapper.find('.search-result-list'))
      .toHaveLength(0);
  });
});
