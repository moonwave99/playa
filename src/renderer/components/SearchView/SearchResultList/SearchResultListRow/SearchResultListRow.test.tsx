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

describe('SearchResultListRow tests', () => {
  it('should render a .search-result-list-item', () => {
		const wrapper = renderInAll(
			<SearchResultListRow
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

  it('should call the onContextMenu handler when right clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <table>
        <tbody>
          <SearchResultListRow
            row={row}
            onContextMenu={handler}
            onCoverDoubleClick={jest.fn()}
            album={albums[0]}/>
        </tbody>
      </table>
		, {
      covers: {
        allById: {}
      }
    });
    wrapper.find('.search-result-list-item').simulate('contextmenu');
    expect(handler).toHaveBeenCalledWith(albums[0]);
  });

});
