import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { toObj } from '../utils/storeUtils';
import { playlists, albums, artists } from '../../../test/testFixtures';

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
  SHOW_DIALOG
} from '../store/modules/ui';

import {
  ActionParams,
  removeAlbumsAction,
  addAlbumsToPlaylistAction
} from './libraryContentActions';

describe('libraryContentActions', () => {
  describe('removeAlbumsAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = removeAlbumsAction({
        selection: [albums[0]._id],
        currentAlbumId: null
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
        artists: {
          allById: toObj(artists)
        },
        library: {
          latest: albums.map(({ _id }) => _id)
        }
      });
      const { handler } = removeAlbumsAction({
        selection: [albums[0]._id],
        currentAlbumId: null,
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

    it('should dispatch SHOW_DIALOG if album is in play', async () => {
      const store = mockStore({
        playlists: {
          allById: toObj([
            playlists[0],
            { ...playlists[1], albums: ['1'] }
          ])
        },
        player: {
          currentAlbumId: '1',
          queue: []
        },
        albums: {
          allById: toObj(albums)
        },
        artists: {
          allById: toObj(artists)
        },
        library: {
          latest: albums.map(({ _id }) => _id)
        }
      });
      const { handler } = removeAlbumsAction({
        selection: [albums[0]._id],
        currentAlbumId: '1',
        dispatch: store.dispatch
      });
      await handler();

      expect(store.getActions()).toEqual([{
        type: SHOW_DIALOG
      }]);
    });
  });

  describe('addAlbumsToPlaylistAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = addAlbumsToPlaylistAction(null as ActionParams);
      expect(typeof title).toBe('string');
      expect(typeof handler).toBe('function');
    });
  });
});
