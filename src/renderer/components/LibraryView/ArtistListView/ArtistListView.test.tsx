import React from 'react';
import { renderInAll, mountInAll } from '../../../../../test/testUtils';
import { artists } from '../../../../../test/testFixtures';
import { Album } from '../../../store/modules/album';
import { toObj } from '../../../utils/storeUtils';
import { ArtistListView } from './ArtistListView';

const defaultStore = {
  player: {
    currentAlbumId: null as Album['_id']
  },
  artists: {
    allById: toObj(artists)
  },
  artistPictures: {
    allById: {}
  },
  library: {
    latest: [] as object[],
    latestAlbumId: null as Album['_id']
  }
};

describe('ArtistListView', () => {
  it('should render a .library-artists', () => {
    const wrapper = renderInAll(
      <ArtistListView
        selectedLetter="a"
        onLetterClick={jest.fn()}
        onContextMenu={jest.fn()}/>
    , defaultStore);
    expect(wrapper.is('.library-artists')).toBe(true);
  });

  it('should contain an .alphabet', () => {
    const wrapper = renderInAll(
      <ArtistListView
        selectedLetter="a"
        onLetterClick={jest.fn()}
        onContextMenu={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.alphabet')).toHaveLength(1);
  });

  it('should contain an .artist-list', () => {
    const wrapper = renderInAll(
      <ArtistListView
        selectedLetter="a"
        onLetterClick={jest.fn()}
        onContextMenu={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.artist-list')).toHaveLength(1);
  });

  it('should select the A letter', () => {
    const wrapper = renderInAll(
      <ArtistListView
        selectedLetter="a"
        onLetterClick={jest.fn()}
        onContextMenu={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.alphabet .letter-a').is('.selected')).toBe(true);
  });

  // 1 artists starting with 'a' in the fixtures
  it('should contain 1 list item', () => {
    const wrapper = renderInAll(
      <ArtistListView
        selectedLetter="a"
        onLetterClick={jest.fn()}
        onContextMenu={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.artist-list .artist-name').text()).toBe('Adorable');
  });

  it('should select letter on letter click', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <ArtistListView
        selectedLetter="a"
        onLetterClick={handler}
        onContextMenu={jest.fn()}/>
    , defaultStore);
    wrapper
      .find('.alphabet .letter-s a')
      .simulate('click');
    expect(handler).toHaveBeenCalledWith('s');
  });
});
