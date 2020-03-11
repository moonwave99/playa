import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { albums, artists, playlists } from '../../../../test/testFixtures';
import { Album, ALBUM_GET_LIST_RESPONSE } from './album';
import { toObj } from '../../utils/storeUtils';

import reducer, {
  LibraryActionTypes,
  getLatestRequest,
  getArtists,
  getArtistReleases,
  addAlbumsToLibrary,
  removeAlbums,
  LIBRARY_GET_LATEST_REQUEST,
  LIBRARY_GET_LATEST_RESPONSE,
  LIBRARY_ADD_TO_LATEST_ALBUMS,
  LIBRARY_GET_ARTISTS_REQUEST,
  LIBRARY_GET_ARTISTS_RESPONSE
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

  describe('getArtists', () => {
    it('should dispatch LIBRARY_GET_ARTISTS_RESPONSE', async () => {
      const store = mockStore({
        library: {
          artistsById: {}
        }
      });
      const expectedActions = [
        {
          type: LIBRARY_GET_ARTISTS_RESPONSE,
          artists
        }
      ];
      await getArtists()(store.dispatch, store.getState);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should dispatch nothing if artists are already present', async () => {
      const store = mockStore({
        library: {
          artistsById: toObj(artists)
        }
      });
      await getArtists()(store.dispatch, store.getState);
      expect(store.getActions()).toHaveLength(0);
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
          type: LIBRARY_GET_ARTISTS_RESPONSE,
          artists: [
            artists.find(({ name }) => name === 'Slowdive'),
            artists.find(({ name }) => name === 'My Bloody Valentine')
          ]
        },
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

  it('should handle LIBRARY_GET_ARTISTS_REQUEST', () => {
    expect(reducer(initialState, {
      type: LIBRARY_GET_ARTISTS_REQUEST
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

  it('should handle LIBRARY_GET_ARTISTS_RESPONSE', () => {
    expect(reducer(initialState, {
      type: LIBRARY_GET_ARTISTS_RESPONSE,
      artists
    })).toEqual({
      latest: [],
      latestAlbumId: null,
      artistsById: toObj(artists)
    });
  });

  it('should handle LIBRARY_ADD_TO_LATEST_ALBUMS', () => {
    expect(reducer(initialState, {
      type: LIBRARY_ADD_TO_LATEST_ALBUMS,
      albums
    })).toEqual({
      latest: albums.map(({ _id }) => _id),
      latestAlbumId: `${Math.max(...albums.map(({ _id }) => +_id))}`,
      artistsById: {}
    });
  });
});
