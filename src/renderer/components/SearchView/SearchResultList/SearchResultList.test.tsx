import * as React from 'react';
import { render } from 'enzyme';
import { renderInAll } from '../../../../../test/testUtils';

import { SearchResultList } from './SearchResultList';
import { albums } from '../../../../../test/testFixtures';

describe('SearchResultList tests', () => {
  it('should render n=results.length rows', () => {
    const wrapper = renderInAll(
      <SearchResultList
        results={albums}
        query="#!q"
        isSearching={false}
        onResultContextMenu={jest.fn()}
        onResultDoubleClick={jest.fn()}/>
    );
    expect(wrapper.find('tbody tr').length).toBe(albums.length);
  });

  it('should render an empty component when results=0', () => {
    const wrapper = render(
      <SearchResultList
        results={[]}
        query="#!q"
        isSearching={false}
        onResultContextMenu={jest.fn()}
        onResultDoubleClick={jest.fn()}/>
    );
    expect(wrapper.is('.search-result-list-empty-component')).toBe(true);
  });
});
