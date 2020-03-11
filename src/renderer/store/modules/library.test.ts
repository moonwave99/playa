import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { albums, artists, playlists } from '../../../../test/testFixtures';
import { Album, ALBUM_GET_LIST_RESPONSE } from './album';
import { toObj } from '../../utils/storeUtils';

import reducer, {
  LibraryActionTypes,
  getLatestRequest,
  getArtistReleases,
  removeAlbums,
  LIBRARY_GET_LATEST_REQUEST,
  LIBRARY_GET_LATEST_RESPONSE
} from './library';

import {
  PLAYER_UPDATE_QUEUE
} from './player';

describe('library actions', () => {
  describe('getLatestRequest', () => {
    it('should dispatch LIBRARY_GET_LATEST_REQUEST and LIBRARY_GET_LATEST_RESPONSE', async () => {
      const store = mockStore({});
      const expectedActions = [
        { type: ALBUM_GET_LIST_RESPONSE },
        { type: LIBRARY_GET_LATEST_RESPONSE }
      ];
      const now = new Date().toISOString();
      await getLatestRequest(now, 20)(store.dispatch);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('getArtistReleases', () => {
    it('should dispatch ALBUM_GET_LIST_RESPONSE', async () => {
      const store = mockStore({});
      const expectedActions = [
        {
          type: ALBUM_GET_LIST_RESPONSE,
          results: albums
        }
      ];
      await getArtistReleases(artists[0])(store.dispatch);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('removeAlbums', () => {
    it('should dispatch LIBRARY_GET_LATEST_RESPONSE', async () => {
      const store = mockStore({
        playlists: {
          allById: toObj(playlists)
        },
        library: {
          latest: albums.map(({ _id }) => _id)
        },
        albums: {
          allById: toObj(albums)
        },
        player: {
          queue: albums.map(({ _id }) => _id)
        }
      });
      const expectedActions = [
        {
          type: LIBRARY_GET_LATEST_RESPONSE,
          results: [albums[1]]
        },
        {
          type: PLAYER_UPDATE_QUEUE,
          queue: [albums[1]._id]
        }
      ];
      await removeAlbums([albums[0]])(store.dispatch, store.getState);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('library reducer', () => {
  const initialState = {
    latest: [] as Album['_id'][],
    latestAlbumId: null as Album['_id'],
    artistsById: {}
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as LibraryActionTypes))
      .toEqual(initialState);
  });

  it('should handle LIBRARY_GET_LATEST_REQUEST', () => {
    expect(reducer(initialState, {
      type: LIBRARY_GET_LATEST_REQUEST
    })).toEqual({
      latest: [],
      latestAlbumId: null,
      artistsById: {}
    });
  });

  it('should handle LIBRARY_GET_LATEST_RESPONSE', () => {
    const results = albums;
    expect(reducer(initialState, {
      type: LIBRARY_GET_LATEST_RESPONSE,
      results
    })).toEqual({
      latest: albums.map(({ _id }) => _id),
      latestAlbumId: albums[1]._id,
      artistsById: {}
    });
  });
});
