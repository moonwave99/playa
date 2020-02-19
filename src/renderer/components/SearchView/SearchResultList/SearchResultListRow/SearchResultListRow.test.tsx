import * as React from 'react';
import { Row, Cell } from 'react-table';
import { renderInAll, mountInAll } from '../../../../../../test/testUtils';
import { albums } from '../../../../../../test/testFixtures';

import { SearchResultListRow } from './SearchResultListRow';

const row = {
  cells: [] as Cell[],
  subRows: [] as Row[],
  id: '1',
  index: 0,
  getRowProps: jest.fn(),
  state: {},
  original: {} as object,
  values: {} as object
}

describe('SearchResultListRow', () => {
  it('should render a .search-result-list-item', () => {
		const wrapper = renderInAll(
			<SearchResultListRow
        style={{}}
        row={row}
        onContextMenu={jest.fn()}
        onCoverDoubleClick={jest.fn()}
        album={albums[0]}/>
		, {
      covers: {
        allById: {}
      }
    });
		expect(wrapper.is('.search-result-list-item')).toBe(true);
  });

  it('should be .is-current if isCurrent = true', () => {
		const wrapper = renderInAll(
			<SearchResultListRow
        style={{}}
        isCurrent
        row={row}
        onContextMenu={jest.fn()}
        onCoverDoubleClick={jest.fn()}
        album={albums[0]}/>
		, {
      covers: {
        allById: {}
      }
    });
		expect(wrapper.is('.is-current')).toBe(true);
  });

  it('should call the onContextMenu handler when right clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <SearchResultListRow
        style={{}}
        row={row}
        onContextMenu={handler}
        onCoverDoubleClick={jest.fn()}
        album={albums[0]}/>
		, {
      covers: {
        allById: {}
      }
    });
    wrapper.find('.search-result-list-item').simulate('contextmenu');
    expect(handler).toHaveBeenCalledWith(albums[0]);
  });
});
