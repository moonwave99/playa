import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { toObj } from '../utils/storeUtils';
import { playlists, albums, tracks } from '../../../test/testFixtures';

import {
  PLAYLIST_DELETE_LIST_RESPONSE
} from '../store/modules/playlist';

import {
  PLAYER_UPDATE_QUEUE,
  PLAYER_PLAY_TRACK
} from '../store/modules/player';

import {
  playPlaylistAction,
  deletePlaylistsAction
} from './playlistListActions';

describe('playlistListActions', () => {
  describe('playPlaylistAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = playPlaylistAction({
        playlists: [playlists[0]]
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
        allById: toObj([
          {
            ...albums[0],
            tracks: [tracks[0]._id, tracks[1]._id]
          },
          albums[1]
        ])
      },
      tracks: {
        allById: toObj(tracks)
      }
    });
    const { handler } = playPlaylistAction({
      playlists: [playlistWithAlbums],
      dispatch: store.dispatch
    });
    await handler();
    const expectedActions = [{
      type: PLAYER_UPDATE_QUEUE,
      queue: playlistWithAlbums.albums
    },{
      type: PLAYER_PLAY_TRACK,
      playlistId: playlistWithAlbums._id,
      albumId: playlistWithAlbums.albums[0],
      trackId: tracks[0]._id
    }];

    expectedActions.forEach(
      action => expect(store.getActions()).toContainEqual(action)
    );
  });

  describe('deletePlaylistsAction', () => {
    it('should return a title and a handler', async () => {
      const { title, handler } = deletePlaylistsAction({
        playlists
      });
      expect(typeof title).toBe('string');
      expect(typeof handler).toBe('function');
    });

    it('should dispatch expected actions', async () => {
      const store = mockStore({
        playlists: {
          allById: toObj(playlists)
        }
      });
      const { handler } = deletePlaylistsAction({
        playlists,
        dispatch: store.dispatch
      });
      await handler();
      const expectedActions = [{
        type: PLAYLIST_DELETE_LIST_RESPONSE,
        playlists
      }];

      expectedActions.forEach(
        action => expect(store.getActions()).toContainEqual(action)
      );
    });
  });
});
