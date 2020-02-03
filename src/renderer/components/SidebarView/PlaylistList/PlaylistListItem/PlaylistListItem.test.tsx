import * as React from 'react';
import { renderInAll, mountInAll } from '../../../../../../test/testUtils';

import { PlaylistListItem } from './PlaylistListItem';
import { playlists } from '../../../../../../test/testFixtures';

describe('PlaylistListItem tests', () => {
  it('should render a .playlist-list-item', () => {
    const wrapper = renderInAll(
      <PlaylistListItem
        playlist={playlists[0]}/>
    );
    expect(wrapper.is('.playlist-list-item')).toBe(true);
  });
  it('should render a .is-new if playlist is new', () => {
    const wrapper = renderInAll(
      <PlaylistListItem
        playlist={{
          ...playlists[0],
          _rev: null
        }}
        isCurrent
        isPlaying/>
    );
    expect(wrapper.is('.is-new')).toBe(true);
  });
  it('should render a .is-playing if playlist isPlaying = true', () => {
    const wrapper = renderInAll(
      <PlaylistListItem
        playlist={playlists[0]}
        isPlaying/>
    );
    expect(wrapper.is('.is-playing')).toBe(true);
  });
  it('should contain a link to the playlist', () => {
    const wrapper = renderInAll(
      <PlaylistListItem
        playlist={playlists[0]}/>
    );
    expect(wrapper.find('.playlist-list-item-link').attr('href')).toBe('/playlist/1');
  });
  it('should contain a play button if isPlaying = false', () => {
    const wrapper = renderInAll(
      <PlaylistListItem
        playlist={{
          ...playlists[0],
          albums: ['1', '2']
        }}/>
    );
    expect(wrapper.find('.play-button')).toHaveLength(1);
  });
  it('should not contain a play button if isPlaying = true', () => {
    const wrapper = renderInAll(
      <PlaylistListItem
        playlist={{
          ...playlists[0],
          albums: ['1', '2']
        }}
        isPlaying/>
    );
    expect(wrapper.find('.play-button')).toHaveLength(0);
  });
  it('should not contain a play button if playlist has no albums', () => {
    const wrapper = renderInAll(
      <PlaylistListItem
        playlist={playlists[0]}/>
    );
    expect(wrapper.find('.play-button')).toHaveLength(0);
  });
  it('should not follow the link if playlist isCurrent', () => {
    const wrapper = mountInAll(
      <PlaylistListItem
        isCurrent
        playlist={playlists[0]}/>
    );
    const link = wrapper.find('a.playlist-list-item-link');
    const preventDefault = jest.fn();
    link.simulate('click', { preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });
  it('should call the onContextMenu handler when right clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <PlaylistListItem
        onContextMenu={handler}
        playlist={playlists[0]}/>
    );
    wrapper.simulate('contextmenu');
    expect(handler).toHaveBeenCalledWith(playlists[0]);
  });
  it('should call the onPlayButtonDoubleClick handler when the play button is double clicked', () => {
    const playlist = {
      ...playlists[0],
      albums: ['1', '2']
    };
    const handler = jest.fn();
    const wrapper = mountInAll(
      <PlaylistListItem
        onPlayButtonDoubleClick={handler}
        playlist={playlist}/>
    );
    const playButton = wrapper.find('.play-button');
    playButton.simulate('doubleClick');
    expect(handler).toHaveBeenCalledWith(playlist);
  });
});
