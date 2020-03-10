import * as React from 'react';
import { renderInAll } from '../../../../test/testUtils';
import { ArtistsView } from './ArtistsView';

const defaultStore = {
  library: {
    artists: [] as object[]
  }
};

describe('ArtistsView', () => {
  it('should render a .library-artists', () => {
    const wrapper = renderInAll(
      <ArtistsView/>
    , defaultStore);
    expect(wrapper.is('.library-artists')).toBe(true);
  });

  it('should contain a title', () => {
    const wrapper = renderInAll(
      <ArtistsView/>
    , defaultStore);
    expect(wrapper.find('h1')).toHaveLength(1);
  });

  it('should render an .library-artists-empty-placeholder if there are no artists', () => {
    const wrapper = renderInAll(
      <ArtistsView/>
    , defaultStore);
    expect(wrapper.find('.library-artists-empty-placeholder')).toHaveLength(1);
  });
});
