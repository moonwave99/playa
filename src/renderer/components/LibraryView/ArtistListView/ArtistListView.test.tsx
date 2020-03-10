import * as React from 'react';
import { renderInAll } from '../../../../../test/testUtils';
import { ArtistListView } from './ArtistListView';

const defaultStore = {
  library: {
    latest: [] as object[],
    latestAlbumID: null as string,
    artistsById: {}
  }
};

describe('ArtistListView', () => {
  it('should render an .library-artists', () => {
    const wrapper = renderInAll(
      <ArtistListView/>
    , defaultStore);
    expect(wrapper.is('.library-artists')).toBe(true);
  });

  it('should render a title', () => {
    const wrapper = renderInAll(
      <ArtistListView/>
    , defaultStore);
    expect(wrapper.find('h2')).toHaveLength(1);
  });
});
