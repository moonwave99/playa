import * as React from 'react';
import { renderInAll, mockRouter } from '../../../../test/testUtils';

mockRouter({
  location: { pathname: '/search', search: 'query=slowdive' }
});

import { SearchView } from './SearchView';

describe('SearchView tests', () => {
  it('should render a .search-view', () => {
		const wrapper = renderInAll(<SearchView/>);
		expect(wrapper.is('.search-view')).toBe(true);
  });

  it('should render a title', () => {
    const store = {
      search: {
        query: 'Slowdive'
      }
    };
		const wrapper = renderInAll(<SearchView/>, store);
		expect(wrapper.find('h1').text())
      .toEqual(`Results for: ${store.search.query}`);
  });
});
