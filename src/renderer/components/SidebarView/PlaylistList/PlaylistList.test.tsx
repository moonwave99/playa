import * as React from 'react';
import { wrap, Wrappers, Renderers, mockRouter } from '../../../../../test/utils';

mockRouter({
  routeParams: { _id: '1' },
  routeMatch: { url: '/playlist/1' }
});

import { PlaylistList } from './PlaylistList';
import { playlists } from '../../../../../test/fixtures';

describe('PlaylistList tests', () => {
  it('should render a .playlist-list', () => {
    const wrapper = wrap(
      Renderers.render,
      Wrappers.Provider,
      Wrappers.Router,
      Wrappers.DndProvider
    )(<PlaylistList playlists={playlists} currentPlaylistId={null}/>);
    expect(wrapper.is('.playlist-list')).toBe(true);
  });
});
