import React from 'react';
import { renderInAll } from '../../../../../../test/testUtils';
import { artists } from '../../../../../../test/testFixtures';
import { toObj } from '../../../../utils/storeUtils';
import { ArtistListItemView } from './ArtistListItemView';

const defaultStore = {
  artists: {
    allById: toObj(artists)
  }
};

describe('ArtistListItemView', () => {
  it('should render an .artist-list-item', () => {
    const wrapper = renderInAll(
      <ArtistListItemView artist={artists[0]}/>
    , defaultStore);
    expect(wrapper.is('.artist-list-item')).toBe(true);
  });

  it('should contain the artist name', () => {
    const wrapper = renderInAll(
      <ArtistListItemView artist={artists[0]}/>
    , defaultStore);
    expect(wrapper.find('.artist-name').text()).toBe(artists[0].name);
  });

  it('should contain the artist release count', () => {
    const wrapper = renderInAll(
      <ArtistListItemView artist={artists[0]}/>
    , defaultStore);
    expect(+wrapper.find('.release-count').text()).toBe(artists[0].count);
  });
});
