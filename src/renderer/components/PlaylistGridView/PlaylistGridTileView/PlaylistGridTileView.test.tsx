import React from 'react';
import { renderInAll, mountInAll } from '../../../../../test/testUtils';
import { playlists } from '../../../../../test/testFixtures';
import { toObj } from '../../../utils/storeUtils';
import { PlaylistGridTileView } from './PlaylistGridTileView';

const defaultStore = {
  playlists: {
    allById: toObj(playlists)
  }
};

describe('PlaylistGridTileView', () => {
  it('should render a .playlist-grid-tile', () => {
    const wrapper = renderInAll(
      <PlaylistGridTileView playlist={playlists[0]}/>
    , defaultStore);
    expect(wrapper.is('.playlist-grid-tile')).toBe(true);
  });

  it('should be .is-playing if isPlaying', () => {
    const wrapper = renderInAll(
      <PlaylistGridTileView isPlaying playlist={playlists[0]}/>
    , defaultStore);
    expect(wrapper.is('.is-playing')).toBe(true);
  });

  it('should be .selected if selected', () => {
    const wrapper = renderInAll(
      <PlaylistGridTileView selected playlist={playlists[0]}/>
    , defaultStore);
    expect(wrapper.is('.selected')).toBe(true);
  });

  it('should contain an .playlist-cover', () => {
    const wrapper = renderInAll(
      <PlaylistGridTileView playlist={playlists[0]}/>
    , defaultStore);
    expect(wrapper.find('.playlist-cover')).toHaveLength(1);
  });

  it('should call the onContextMenu handler when right clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <PlaylistGridTileView
        onContextMenu={handler}
        playlist={playlists[0]}/>
    , defaultStore);
    wrapper.find('figure').simulate('contextmenu');
    expect(handler).toHaveBeenCalledWith(playlists[0]);
  });
});
