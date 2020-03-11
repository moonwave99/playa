import * as React from 'react';
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
  it('should render an .library-artists', () => {
    const wrapper = renderInAll(
      <ArtistListView/>
    , defaultStore);
    expect(wrapper.is('.library-artists')).toBe(true);
  });

  it('should contain a title', () => {
    const wrapper = renderInAll(
      <ArtistListView/>
    , defaultStore);
    expect(wrapper.find('h2')).toHaveLength(1);
  });

  it('should contain an .alphabet', () => {
    const wrapper = renderInAll(
      <ArtistListView/>
    , defaultStore);
    expect(wrapper.find('.alphabet')).toHaveLength(1);
  });

  it('should contain an .artist-list', () => {
    const wrapper = renderInAll(
      <ArtistListView/>
    , defaultStore);
    expect(wrapper.find('.artist-list')).toHaveLength(1);
  });

  it('should select the A letter', () => {
    const wrapper = renderInAll(
      <ArtistListView/>
    , defaultStore);
    expect(wrapper.find('.alphabet .letter-a').is('.selected')).toBe(true);
  });

  // 1 artists starting with 'a' in the fixtures
  it('should contain 1 list item', () => {
    const wrapper = renderInAll(
      <ArtistListView/>
    , defaultStore);
    expect(wrapper.find('.artist-list .artist-name').text()).toBe('Adorable');
  });

  it('should select letter on letter click', () => {
    const wrapper = mountInAll(
      <ArtistListView/>
    , defaultStore);
    const letter = wrapper.find('.alphabet .letter-s');
    letter.find('a').simulate('click');
    expect(wrapper.find('.alphabet .letter-s').is('.selected')).toBe(true);
  });

  it('should display artists on letter click', () => {
    const wrapper = mountInAll(
      <ArtistListView/>
    , defaultStore);
    const letter = wrapper.find('.alphabet li').at(0);
    letter.find('a').simulate('click');
    expect(wrapper.find('.artist-list .artist-name').text()).toBe('883');

    const vaLetter = wrapper.find('.alphabet li').last();
    vaLetter.find('a').simulate('click');
    expect(wrapper.find('.artist-list .artist-name').text()).toBe('_various-artists');
  });
});
