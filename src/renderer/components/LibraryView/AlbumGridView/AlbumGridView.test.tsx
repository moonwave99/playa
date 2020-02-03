import * as React from 'react';
import { renderInAll, mountInAll } from '../../../../../test/testUtils';
import { albums } from '../../../../../test/testFixtures';
import { AlbumGridView } from './AlbumGridView';

describe('AlbumGridView tests', () => {
  it('should render an .album-grid', () => {
    const wrapper = renderInAll(
      <AlbumGridView
        albums={albums}
        currentAlbumId={null}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    );
    expect(wrapper.is('.album-grid')).toBe(true);
  });

  it('should render n=albums.length .album-grid-tile', () => {
    const wrapper = renderInAll(
      <AlbumGridView
        albums={albums}
        currentAlbumId={null}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    );
    expect(wrapper.find('.album-grid-tile')).toHaveLength(albums.length);
  });
});
