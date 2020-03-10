import * as React from 'react';
import { renderInAll } from '../../../../../../test/testUtils';
import { artists } from '../../../../../../test/testFixtures';
import { ArtistListItemView } from './ArtistListItemView';

describe('ArtistListItemView', () => {
  it('should render an .artist-list-item', () => {
    const wrapper = renderInAll(
      <ArtistListItemView artist={artists[0]}/>
    );
    expect(wrapper.is('.artist-list-item')).toBe(true);
  });

  it('should contain the artist name', () => {
    const wrapper = renderInAll(
      <ArtistListItemView artist={artists[0]}/>
    );
    expect(wrapper.find('.artist-name').text()).toBe(artists[0].name);
  });

  it('should contain the artist release count', () => {
    const wrapper = renderInAll(
      <ArtistListItemView artist={artists[0]}/>
    );
    expect(+wrapper.find('.release-count').text()).toBe(artists[0].count);
  });
});
