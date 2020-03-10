import * as React from 'react';
import { renderInAll, mountInAll } from '../../../../../../test/testUtils';
import { albums } from '../../../../../../test/testFixtures';
import { AlbumGridTileView } from './AlbumGridTileView';

describe('AlbumGridTileView', () => {
  it('should render a .album-grid-tile', () => {
    const wrapper = renderInAll(
      <AlbumGridTileView album={albums[0]}/>
    );
    expect(wrapper.is('.album-grid-tile')).toBe(true);
  });

  it('should be a .is-playing if isPlaying', () => {
    const wrapper = renderInAll(
      <AlbumGridTileView isPlaying album={albums[0]}/>
    );
    expect(wrapper.is('.is-playing')).toBe(true);
  });

  it('should contain an .album-cover', () => {
    const wrapper = renderInAll(
      <AlbumGridTileView album={albums[0]}/>
    );
    expect(wrapper.find('.album-cover')).toHaveLength(1);
  });

  it('should call the onDoubleClick handler when double clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <AlbumGridTileView
        onDoubleClick={handler}
        album={albums[0]}/>
    );
    wrapper.find('figure').simulate('doubleClick');
    expect(handler).toHaveBeenCalledWith(albums[0]);
  });

  it('should call the onContextMenu handler when right clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <AlbumGridTileView
        onContextMenu={handler}
        album={albums[0]}/>
    );
    wrapper.find('figure').simulate('contextmenu');
    expect(handler).toHaveBeenCalledWith(albums[0]);
  });
});
