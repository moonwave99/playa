import * as React from 'react';
import { renderInAll } from '../../../../../test/testUtils';
import { playlists, albums } from '../../../../../test/testFixtures';
import { toObj } from '../../../utils/storeUtils';

import { AlbumView } from './AlbumView';

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

describe('AlbumView tests', () => {
  it('should render an .album-view', () => {
    const wrapper = renderInAll(
      <AlbumView
        currentTrackId={null}
        album={albums[0]}
        dragType={''}
        albumActions={[]}
        onContextMenu={jest.fn()}
        onDoubleClick={jest.fn()}
      />
      , defaultStore);
    expect(wrapper.is('.album-view')).toBe(true);
  });

  it('should be .is-current if isCurrent', () => {
    const wrapper = renderInAll(
      <AlbumView
        isCurrent
        currentTrackId={null}
        album={albums[0]}
        dragType={''}
        albumActions={[]}
        onContextMenu={jest.fn()}
        onDoubleClick={jest.fn()}
      />
      , defaultStore);
    expect(wrapper.is('.is-current')).toBe(true);
  });

  it('should contain an .album-cover', () => {
    const wrapper = renderInAll(
      <AlbumView
        currentTrackId={null}
        album={albums[0]}
        dragType={''}
        albumActions={[]}
        onContextMenu={jest.fn()}
        onDoubleClick={jest.fn()}
      />
      , defaultStore);
    expect(wrapper.find('.album-cover')).toHaveLength(1);
  });

  it('should contain a title', () => {
    const wrapper = renderInAll(
      <AlbumView
        currentTrackId={null}
        album={albums[0]}
        dragType={''}
        albumActions={[]}
        onContextMenu={jest.fn()}
        onDoubleClick={jest.fn()}
      />
      , defaultStore);
    expect(wrapper.find('h2').text()).toBe(albums[0].title);
  });

  it('should contain the album artist', () => {
    const wrapper = renderInAll(
      <AlbumView
        currentTrackId={null}
        album={albums[0]}
        dragType={''}
        albumActions={[]}
        onContextMenu={jest.fn()}
        onDoubleClick={jest.fn()}
      />
      , defaultStore);
    expect(wrapper.find('.album-artist').text())
      .toBe(albums[0].artist);
  });

  it('should contain the album information', () => {
    const wrapper = renderInAll(
      <AlbumView
        currentTrackId={null}
        album={albums[0]}
        dragType={''}
        albumActions={[]}
        onContextMenu={jest.fn()}
        onDoubleClick={jest.fn()}
      />
      , defaultStore);
    expect(wrapper.find('.album-info').text())
      .toBe(`${albums[0].year} - ${albums[0].type}`);
  });

  it('should contain the album tracklist', () => {
    const wrapper = renderInAll(
      <AlbumView
        currentTrackId={null}
        album={albums[0]}
        dragType={''}
        albumActions={[]}
        onContextMenu={jest.fn()}
        onDoubleClick={jest.fn()}
      />
      , defaultStore);
    expect(wrapper.find('.tracklist-view')).toHaveLength(1);
  });
});
