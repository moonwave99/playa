import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { toObj } from '../utils/storeUtils';
import { playlists, albums } from '../../../test/testFixtures';

import {
  PLAYLIST_SAVE_RESPONSE
} from '../store/modules/playlist';

import {
  removeAlbumsAction
} from './playlistContentActions';

describe('playlistContentActions', () => {
  describe('removeAlbumsAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = removeAlbumsAction({
        selection: [albums[0]._id],
        playlist: playlists[0]
      });
      expect(typeof title).toBe('string');
      expect(typeof handler).toBe('function');
    });
  });

  it('should dispatch expected actions', async () => {
    const playlistWithAlbums = { ...playlists[0], albums: ['1', '2'] };
    const store = mockStore({
      playlists: {
        allById: toObj([
          playlistWithAlbums,
          playlists[1]
        ])
      },
      player: {
        queue: []
      },
      albums: {
        allById: toObj(albums)
      }
    });
    const { handler } = removeAlbumsAction({
      selection: [albums[0]._id],
      playlist: playlistWithAlbums,
      dispatch: store.dispatch
    });
    await handler();
    const expectedActions = [{
      type: PLAYLIST_SAVE_RESPONSE,
      playlist: {
        ...playlistWithAlbums,
        albums: ['2']
      }
    }];

    expectedActions.forEach(
      action => expect(store.getActions()).toContainEqual(action)
    );
  });
});
