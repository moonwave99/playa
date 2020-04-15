import React from 'react';
import { renderInAll } from '../../../../../test/testUtils';

import { toObj } from '../../../utils/storeUtils';
import { albums, artists } from '../../../../../test/testFixtures';
import { SearchResultList } from './SearchResultList';

describe('SearchResultList', () => {
  it('should render a .search-result-list', () => {
    const store = {
      search: {},
      player: {},
      artists: {
        allById: toObj(artists)
      }
    };
    const wrapper = renderInAll(
      <SearchResultList
        results={albums}
        query="#!q"
        isSearching={false}
        onContextMenu={jest.fn()}
        onResultDoubleClick={jest.fn()}
        onResultEnter={jest.fn()}/>
    , store);
    expect(wrapper.is('.search-result-list')).toBe(true);
  });

  it('should render an empty component when results=0', () => {
    const wrapper = renderInAll(
      <SearchResultList
        results={[]}
        query="#!q"
        isSearching={false}
        onContextMenu={jest.fn()}
        onResultDoubleClick={jest.fn()}
        onResultEnter={jest.fn()}/>
    );
    expect(wrapper.is('.search-result-list-empty-component')).toBe(true);
  });
});
