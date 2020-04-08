import React from 'react';
import { renderInAll, mountInAll } from '../../../../../../test/testUtils';
import { albums, artists } from '../../../../../../test/testFixtures';
import { toObj } from '../../../../utils/storeUtils';
import { AlbumGridTileView } from './AlbumGridTileView';

const defaultStore = {
  artists: {
    allById: toObj(artists)
  }
};

describe('AlbumGridTileView', () => {
  it('should render a .album-grid-tile', () => {
    const wrapper = renderInAll(
      <AlbumGridTileView album={albums[0]}/>
    , defaultStore);
    expect(wrapper.is('.album-grid-tile')).toBe(true);
  });

  it('should be .is-playing if isPlaying', () => {
    const wrapper = renderInAll(
      <AlbumGridTileView isPlaying album={albums[0]}/>
    , defaultStore);
    expect(wrapper.is('.is-playing')).toBe(true);
  });

  it('should be .selected if selected', () => {
    const wrapper = renderInAll(
      <AlbumGridTileView selected album={albums[0]}/>
    , defaultStore);
    expect(wrapper.is('.selected')).toBe(true);
  });

  it('should be .is-dragging if isDragging && selected', () => {
    const wrapper = renderInAll(
      <AlbumGridTileView selected isDragging album={albums[0]}/>
    , defaultStore);
    expect(wrapper.is('.is-dragging')).toBe(true);
  });

  it('should contain an .album-cover', () => {
    const wrapper = renderInAll(
      <AlbumGridTileView album={albums[0]}/>
    , defaultStore);
    expect(wrapper.find('.album-cover')).toHaveLength(1);
  });

  it('should contain an .album-artist', () => {
    const wrapper = renderInAll(
      <AlbumGridTileView album={albums[0]}/>
    , defaultStore);
    expect(wrapper.find('.album-artist')).toHaveLength(1);
  });

  it('should not contain an .album-artist if !showArtist', () => {
    const wrapper = renderInAll(
      <AlbumGridTileView album={albums[0]} showArtist={false}/>
    , defaultStore);
    expect(wrapper.find('.album-artist')).toHaveLength(0);
  });

  it('should call the onDoubleClick handler when double clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <AlbumGridTileView
        onDoubleClick={handler}
        album={albums[0]}/>
    , defaultStore);
    wrapper.find('figure').simulate('doubleClick');
    expect(handler).toHaveBeenCalledWith({
      album: albums[0],
      artist: artists[0]
    });
  });

  it('should call the onContextMenu handler when right clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <AlbumGridTileView
        onContextMenu={handler}
        album={albums[0]}/>
    , defaultStore);
    wrapper.find('figure').simulate('contextmenu');
    expect(handler).toHaveBeenCalledWith({
      album: albums[0],
      artist: artists[0],
      selection: [albums[0]._id]
    });
  });
});
