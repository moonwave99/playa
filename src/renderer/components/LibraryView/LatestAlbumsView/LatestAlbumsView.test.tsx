import React from 'react';
import { renderInAll } from '../../../../../test/testUtils';
import { albums } from '../../../../../test/testFixtures';
import { LatestAlbumsView } from './LatestAlbumsView';

describe('LatestAlbumsView', () => {
  it('should render an .library-latest-albums', () => {
    const wrapper = renderInAll(
      <LatestAlbumsView
        albums={albums}
        currentAlbumId={null}
        loading={false}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    );
    expect(wrapper.is('.library-latest-albums')).toBe(true);
  });

  it('should render an .album-grid', () => {
    const wrapper = renderInAll(
      <LatestAlbumsView
        albums={albums}
        currentAlbumId={null}
        loading={false}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    );
    expect(wrapper.find('.album-grid')).toHaveLength(1);
  });

  it('should render a .library-latest-albums-empty-placeholder if there are no albums', () => {
    const wrapper = renderInAll(
      <LatestAlbumsView
        albums={[]}
        currentAlbumId={null}
        loading={false}
        onAlbumContextMenu={jest.fn()}
        onAlbumDoubleClick={jest.fn()}/>
    );
    expect(wrapper.find('.album-grid')).toHaveLength(0);
    expect(wrapper.find('.library-latest-albums-empty-placeholder')).toHaveLength(1);
  });
});
