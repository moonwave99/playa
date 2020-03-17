import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { albums, playlists } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
import { PLAYLIST_GET_LIST_RESPONSE } from './playlist';

import { Album, ALBUM_GET_LIST_RESPONSE } from './album';

import reducer, {
  LibraryActionTypes,
  getLatestRequest,
  addAlbumsToLibrary,
  removeAlbums,
  LIBRARY_GET_LATEST_REQUEST,
  LIBRARY_GET_LATEST_RESPONSE,
  LIBRARY_ADD_TO_LATEST_ALBUMS
} from './library';

import {
  PLAYER_UPDATE_QUEUE
} from './player';

describe('library actions', () => {
  describe('getLatestRequest', () => {
    it('should dispatch LIBRARY_GET_LATEST_REQUEST and LIBRARY_GET_LATEST_RESPONSE', async () => {
      const store = mockStore({});
      const expectedActions = [
        { type: LIBRARY_GET_LATEST_REQUEST },
        { type: ALBUM_GET_LIST_RESPONSE },
        { type: LIBRARY_GET_LATEST_RESPONSE }
      ];
      const now = new Date().toISOString();
      await getLatestRequest(now, 20)(store.dispatch);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('addAlbumsToLibrary', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({
        library: {
          artistsById: {}
        }
      });
      const expectedActions = [
        {
          type: ALBUM_GET_LIST_RESPONSE,
          results: albums
        },
        {
          type: LIBRARY_ADD_TO_LATEST_ALBUMS,
          albums
        }
      ];
      await addAlbumsToLibrary(albums)(store.dispatch, store.getState);
      expectedActions.forEach(
        action => expect(store.getActions()).toContainEqual(action)
      );
    });
  });

  describe('removeAlbums', () => {
    it('should dispatch expected actions', async () => {
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
        },
        tracks: {
          allById: {}
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

    it('should not dispatch anything if no album is found', async () => {
      const store = mockStore({
        playlists: {
          allById: {}
        },
        library: {
          latest: []
        },
        albums: {
          allById: {}
        },
        player: {
          queue: []
        },
        tracks: {
          allById: {}
        }
      });
      await removeAlbums([])(store.dispatch, store.getState);
      expect(store.getActions()).toEqual([]);
    });

    it('should remove albums from playlists that contain them', async () => {
      const store = mockStore({
        playlists: {
          allById: toObj([
           {...playlists[0], albums: [albums[0]._id]},
           playlists[1]
          ])
        },
        library: {
          latest: albums.map(({ _id }) => _id)
        },
        albums: {
          allById: toObj(albums)
        },
        player: {
          queue: albums.map(({ _id }) => _id)
        },
        tracks: {
          allById: {}
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
        },
        {
          type: PLAYLIST_GET_LIST_RESPONSE,
          playlists: [playlists[0]]
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
    loadingLatest: false,
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
      loadingLatest: true,
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
      loadingLatest: false,
      artistsById: {}
    });

    expect(reducer(initialState, {
      type: LIBRARY_GET_LATEST_RESPONSE,
      results: []
    })).toEqual({
      latest: [],
      latestAlbumId: '0',
      loadingLatest: false,
      artistsById: {}
    });
  });

  it('should handle LIBRARY_ADD_TO_LATEST_ALBUMS', () => {
    expect(reducer(initialState, {
      type: LIBRARY_ADD_TO_LATEST_ALBUMS,
      albums
    })).toEqual({
      latest: albums.map(({ _id }) => _id),
      latestAlbumId: `${Math.max(...albums.map(({ _id }) => +_id))}`,
      loadingLatest: false,
      artistsById: {}
    });
  });
});
