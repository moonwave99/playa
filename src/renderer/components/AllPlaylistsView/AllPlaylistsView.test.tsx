import * as React from 'react';
import { renderInAll, mountInAll } from '../../../../test/testUtils';
import { playlists } from '../../../../test/testFixtures';

import { AllPlaylistsView } from './AllPlaylistsView';

const defaultStore = {
  player: {
    queue: [] as string[]
  },
  playlists: {
    allById: {}
  },
  albums: {
    allById: {}
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

describe('AllPlaylistsView tests', () => {
  it('should render a .all-playlists-view', () => {
    const wrapper = renderInAll(
      <AllPlaylistsView
        playlists={playlists}
        onPlaylistDelete={jest.fn()}
        onPlaylistContextMenu={jest.fn()}/>
      , defaultStore);
    expect(wrapper.is('.all-playlists-view')).toBe(true);
  });

  it('should render a title', () => {
    const wrapper = renderInAll(
      <AllPlaylistsView
        playlists={playlists}
        onPlaylistDelete={jest.fn()}
        onPlaylistContextMenu={jest.fn()}/>
      , defaultStore);
    expect(wrapper.find('h1')).toHaveLength(1);
  });

  it('should render n=playlists length rows', () => {
    const wrapper = renderInAll(
      <AllPlaylistsView
        playlists={playlists}
        onPlaylistDelete={jest.fn()}
        onPlaylistContextMenu={jest.fn()}/>
      , defaultStore);
    expect(wrapper.find('tbody tr')).toHaveLength(playlists.length);
  });

  it('should call the onPlaylistDelete handler when the delete link in a row is clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <AllPlaylistsView
        playlists={playlists}
        onPlaylistDelete={handler}
        onPlaylistContextMenu={jest.fn()}/>
      , defaultStore);
    wrapper.find('tbody .cell-delete a').at(0).simulate('click');
    expect(handler).toHaveBeenCalledWith(playlists[0]);
  });

  it('should call the onPlaylistContextMenu handler when a row is right clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <AllPlaylistsView
        playlists={playlists}
        onPlaylistDelete={jest.fn()}
        onPlaylistContextMenu={handler}/>
      , defaultStore);
    wrapper.find('tbody tr').at(0).simulate('contextmenu');
    expect(handler).toHaveBeenCalledWith(playlists[0]);
  });
});
