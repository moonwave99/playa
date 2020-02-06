import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { toObj } from '../utils/storeUtils';
import { playlists, albums } from '../../../test/testFixtures';

import {
  PLAYLIST_GET_LIST_RESPONSE
} from '../store/modules/playlist';

import {
  Album
} from '../store/modules/album';

import {
  LIBRARY_GET_LATEST_RESPONSE
} from '../store/modules/library';

import {
  PLAYER_UPDATE_QUEUE
} from '../store/modules/player';

import {
  removeAlbumsAction
} from './libraryContentActions';

describe('libraryContentActions', () => {
  describe('removeAlbumsAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = removeAlbumsAction({
        selection: [albums[0]],
        playingAlbumID: null
      });
      expect(typeof title).toBe('string');
      expect(typeof handler).toBe('function');
    });

    it('should dispatch expected actions', async () => {
      const store = mockStore({
        playlists: {
          allById: toObj([
            playlists[0],
            { ...playlists[1], albums: ['1'] }
          ])
        },
        player: {
          queue: []
        },
        albums: {
          allById: toObj(albums)
        },
        library: {
          latest: albums.map(({ _id }) => _id)
        }
      });
      const { handler } = removeAlbumsAction({
        selection: [albums[0]],
        playingAlbumID: null,
        dispatch: store.dispatch
      });
      await handler();
      const expectedActions = [{
        type: LIBRARY_GET_LATEST_RESPONSE,
        results: [albums[1]]
      },
      {
        type: PLAYER_UPDATE_QUEUE,
        queue: [] as Album[]
      },
      {
        type: PLAYLIST_GET_LIST_RESPONSE,
        playlists: [playlists[1]]
      }];

      expectedActions.forEach(
        action => expect(store.getActions()).toContainEqual(action)
      );
    });
  });
});
