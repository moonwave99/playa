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
  library: {
    latest: [] as object[],
    latestAlbumId: null as Album['_id'],
    artistsById: toObj(artists)
  }
};

describe('ArtistListView', () => {
  it('should render a .library-artists', () => {
    const wrapper = renderInAll(
      <ArtistListView
        selectedLetter="a"
        loading={false}
        onLetterClick={jest.fn()}/>
    , defaultStore);
    expect(wrapper.is('.library-artists')).toBe(true);
  });

  it('should contain an .alphabet', () => {
    const wrapper = renderInAll(
      <ArtistListView
        selectedLetter="a"
        loading={false}
        onLetterClick={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.alphabet')).toHaveLength(1);
  });

  it('should contain an .artist-list', () => {
    const wrapper = renderInAll(
      <ArtistListView
        selectedLetter="a"
        loading={false}
        onLetterClick={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.artist-list')).toHaveLength(1);
  });

  it('should be .loading if loading', () => {
    const wrapper = renderInAll(
      <ArtistListView
        selectedLetter="a"
        loading={true}
        onLetterClick={jest.fn()}/>
    , defaultStore);
    expect(wrapper.is('.loading')).toBe(true);
  });

  it('should select the A letter', () => {
    const wrapper = renderInAll(
      <ArtistListView
        selectedLetter="a"
        loading={false}
        onLetterClick={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.alphabet .letter-a').is('.selected')).toBe(true);
  });

  // 1 artists starting with 'a' in the fixtures
  it('should contain 1 list item', () => {
    const wrapper = renderInAll(
      <ArtistListView
        selectedLetter="a"
        loading={false}
        onLetterClick={jest.fn()}/>
    , defaultStore);
    expect(wrapper.find('.artist-list .artist-name').text()).toBe('Adorable');
  });

  it('should select letter on letter click', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <ArtistListView
        selectedLetter="a"
        loading={false}
        onLetterClick={handler}/>
    , defaultStore);
    wrapper
      .find('.alphabet .letter-s a')
      .simulate('click');
    expect(handler).toHaveBeenCalledWith('s');
  });
});
