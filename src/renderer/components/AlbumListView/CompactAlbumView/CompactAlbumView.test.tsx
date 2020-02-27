import * as React from 'react';
import { renderInAll, mountInAll } from '../../../../../test/testUtils';
import { playlists, albums } from '../../../../../test/testFixtures';
import { toObj } from '../../../utils/storeUtils';

import { CompactAlbumView } from './CompactAlbumView';

const defaultStore = {
  player: {
    queue: [] as string[]
  },
  playlists: {
    allById: toObj(playlists)
  },
  albums: {
    allById: toObj(albums)
  },
  tracks: {
    allById: {}
  },
  covers: {
    allById: {}
  },
  waveforms: {
    allById: {}
  }
};

describe('CompactAlbumView', () => {
  it('should render a .compact-album-view', () => {
    const wrapper = renderInAll(
      <CompactAlbumView
        index={0}
        album={albums[0]}
        albumActions={[]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.is('.compact-album-view')).toBe(true);
  });

  it('should be .is-current if isCurrent', () => {
    const wrapper = renderInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        album={albums[0]}
        albumActions={[]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.is('.is-current')).toBe(true);
  });

  it('should be .sortable if sortable', () => {
    const wrapper = renderInAll(
      <CompactAlbumView
        sortable
        index={0}
        album={albums[0]}
        albumActions={[]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.is('.sortable')).toBe(true);
  });

  it('should contain an .album-cover', () => {
    const wrapper = renderInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        album={albums[0]}
        albumActions={[]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.find('.album-cover')).toHaveLength(1);
  });

  it('should contain the album title', () => {
    const wrapper = renderInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        album={albums[0]}
        albumActions={[]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.find('.title').text())
      .toBe(albums[0].title);
  });

  it('should contain the album info', () => {
    const wrapper = renderInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        album={albums[0]}
        albumActions={[]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.find('.info').text())
      .toBe(`${albums[0].artist}, ${albums[0].year} - ${albums[0].type}`);
  });

  it('should call the onContextMenu handler when right clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        album={albums[0]}
        albumActions={[]}
        onAlbumMove={jest.fn()}
        onContextMenu={handler}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    wrapper.simulate('contextmenu');
    expect(handler).toHaveBeenCalledWith(albums[0]);
  });

  it('should call the onDoubleClick handler when the cover is double clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        album={albums[0]}
        albumActions={[]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onDoubleClick={handler}/>
      , defaultStore);
    wrapper.simulate('doubleClick')
    expect(handler).toHaveBeenCalledWith(albums[0]);
  });
});
