import * as React from 'react';
import { Row, Cell, ColumnInstance } from 'react-table';
import { Album } from '../../../../store/modules/album';
import { renderInAll, mountInAll } from '../../../../../../test/testUtils';
import { albums } from '../../../../../../test/testFixtures';

import { SearchResultListRow } from './SearchResultListRow';

function generateRow(album: Album, index = 0): Row {
  return {
    cells: [
      {
        column: {
          id: 'cover'
        } as ColumnInstance,
        row: null,
        value: null,
        getCellProps: () => ({ key: `cover_${index}`, role: 'cell' }),
        render: null
      } as Cell,
      ...['artist', 'title', 'year', 'type'].map(id => ({
        column: { id } as ColumnInstance,
        row: null,
        value: (album as unknown as { [key: string]: string })[id],
        getCellProps: () => ({ key: `${id}_${index}`, role: 'cell' }),
        render: null
      } as Cell))
    ],
    subRows: [] as Row[],
    id: album._id,
    index,
    getRowProps: () => ({ key: album._id, role: 'row' }),
    state: {},
    original: album,
    values: {} as object
  } as Row;
}

describe('SearchResultListRow', () => {
  const row = generateRow(albums[0]);
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

  it('should contain search result info', () => {
    const wrapper = mountInAll(
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
    expect(wrapper.find('.cell-artist').text()).toBe(albums[0].artist);
    expect(wrapper.find('.cell-title').text()).toBe(albums[0].title);
    expect(wrapper.find('.cell-year').text()).toBe(`${albums[0].year}`);
    expect(wrapper.find('.cell-type').text()).toBe(albums[0].type);
  });
});
