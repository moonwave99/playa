import * as React from 'react';
import { renderInAll } from '../../../../../test/testUtils';

import { SearchResultList } from './SearchResultList';
import { albums } from '../../../../../test/testFixtures';

describe('SearchResultList', () => {
  it('should render a .search-result-list', () => {
    const wrapper = renderInAll(
      <SearchResultList
        results={albums}
        query="#!q"
        isSearching={false}
        onContextMenu={jest.fn()}
        onArtistContextMenu={jest.fn()}
        onResultDoubleClick={jest.fn()}
        onResultEnter={jest.fn()}/>
    );
    expect(wrapper.is('.search-result-list')).toBe(true);
  });

  it('should render an empty component when results=0', () => {
    const wrapper = renderInAll(
      <SearchResultList
        results={[]}
        query="#!q"
        isSearching={false}
        onContextMenu={jest.fn()}
        onArtistContextMenu={jest.fn()}
        onResultDoubleClick={jest.fn()}
        onResultEnter={jest.fn()}/>
    );
    expect(wrapper.is('.search-result-list-empty-component')).toBe(true);
  });
});
