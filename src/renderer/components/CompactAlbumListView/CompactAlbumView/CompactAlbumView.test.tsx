import React from 'react';
import { renderInAll, mountInAll } from '../../../../../test/testUtils';
import { playlists, albums, artists } from '../../../../../test/testFixtures';
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
  artists: {
    allById: toObj(artists)
  },
  tracks: {
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
        selectedIDs={[]}
        album={albums[0]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onClick={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.is('.compact-album-view')).toBe(true);
  });

  it('should be .is-current if isCurrent', () => {
    const wrapper = renderInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        selectedIDs={[]}
        album={albums[0]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onClick={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.is('.is-current')).toBe(true);
  });

  it('should be .sortable if sortable', () => {
    const wrapper = renderInAll(
      <CompactAlbumView
        sortable
        index={0}
        selectedIDs={[]}
        album={albums[0]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onClick={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.is('.sortable')).toBe(true);
  });

  it('should contain an .album-cover', () => {
    const wrapper = renderInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        selectedIDs={[]}
        album={albums[0]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onClick={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.find('.album-cover')).toHaveLength(1);
  });

  it('should contain the album title', () => {
    const wrapper = renderInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        selectedIDs={[]}
        album={albums[0]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onClick={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.find('.album-title').text())
      .toBe(albums[0].title);
  });

  it('should contain the album info', () => {
    const wrapper = renderInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        selectedIDs={[]}
        album={albums[0]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onClick={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(+wrapper.find('.album-year').text()).toBe(albums[0].year);
    expect(wrapper.find('.album-artist').text()).toBe(artists[0].name);
  });

  it('should contain a placeholder if artist is not found', () => {
    const wrapper = renderInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        selectedIDs={[]}
        album={albums[0]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onClick={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , {
        ...defaultStore,
        artists: {
          allById: {}
        }
      });
    expect(wrapper.find('.album-artist-link.loading')).toHaveLength(1);
  });

  it('should not render the year if album has it not', () => {
    const wrapper = renderInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        selectedIDs={[]}
        album={{
          ...albums[0],
          year: null
        }}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onClick={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    expect(wrapper.find('.album-year')).toHaveLength(0);
  });

  it('should call the onContextMenu handler when right clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        selectedIDs={[]}
        album={albums[0]}
        onAlbumMove={jest.fn()}
        onContextMenu={handler}
        onClick={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    wrapper.simulate('contextmenu');
    expect(handler).toHaveBeenCalledWith({
      album: albums[0],
      artist: artists[0],
      selection: [albums[0]._id]
    });
  });

  it('should call the onContextMenu handler when the action buttons is clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        selectedIDs={[]}
        album={albums[0]}
        onAlbumMove={jest.fn()}
        onContextMenu={handler}
        onClick={jest.fn()}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    wrapper.find('.button-album-actions').simulate('click');
    expect(handler).toHaveBeenCalledWith({
      album: albums[0],
      artist: artists[0],
      selection: [albums[0]._id]
    });
  });

  it('should call the onDoubleClick handler when the cover is double clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        selectedIDs={[]}
        album={albums[0]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onClick={jest.fn()}
        onDoubleClick={handler}/>
      , defaultStore);
    wrapper.find('.album-cover').at(0).simulate('doubleClick')
    expect(handler).toHaveBeenCalledWith({
      album: albums[0],
      artist: artists[0]
    });
  });

  it('should call the onClick handler when clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <CompactAlbumView
        isCurrent
        index={0}
        selectedIDs={[]}
        album={albums[0]}
        onAlbumMove={jest.fn()}
        onContextMenu={jest.fn()}
        onClick={handler}
        onDoubleClick={jest.fn()}/>
      , defaultStore);
    wrapper.find('.album-inner-wrapper').at(0).simulate('click');
    expect(handler).toHaveBeenCalled();
  });
});
