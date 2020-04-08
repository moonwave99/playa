import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { playlists, albums, artists, tracks } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';

import reducer, {
  LibraryActionTypes,
  getLatestRequest,
  importAlbum,
  removeAlbums,
  LIBRARY_GET_LATEST_REQUEST,
  LIBRARY_GET_LATEST_RESPONSE,
  LIBRARY_ADD_TO_LATEST_ALBUMS
} from './library';

import { PLAYLIST_GET_LIST_RESPONSE } from './playlist';

import {
  Album,
  ALBUM_SAVE_RESPONSE,
  ALBUM_GET_LIST_RESPONSE,
  ALBUM_DELETE_LIST_RESPONSE,
} from './album';

import {
  getDefaultArtist,
  VARIOUS_ARTISTS_ID,
  ARTIST_SAVE_RESPONSE
} from './artist';

import {
  TRACK_GET_LIST_RESPONSE
} from './track';

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

  describe('importAlbum', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({
        albums: {
          allById: {}
        },
        artists: {
          allById: {},
          latestArtistId: '0'
        },
        tracks: {
          allById: {}
        },
        library: {
          latest: [],
          latestAlbumId: '0'
        }
      });
      const expectedActions = [
        {
          type: TRACK_GET_LIST_RESPONSE,
          results: tracks
        },
        {
          type: ALBUM_SAVE_RESPONSE,
          album: { ...albums[0], _id: '1', artist: '1' }
        },
        {
          type: LIBRARY_ADD_TO_LATEST_ALBUMS,
          albums: [{ ...albums[0], _id: '1', artist: '1' }]
        },
        {
          type: ALBUM_GET_LIST_RESPONSE,
          results: [{ ...albums[0], _id: '1', artist: '1' }]
        }
      ];
      await importAlbum({
        album: { ...albums[0], _id: null },
        artist: artists[0],
        tracks
      })(store.dispatch, store.getState);
      expectedActions.forEach(
        action => expect(store.getActions()).toContainEqual(action)
      );
    });

    it('should update existing artist if artist name from params exists', async () => {
      const store = mockStore({
        albums: {
          allById: {}
        },
        artists: {
          allById: toObj(artists),
          latestArtistId: '4'
        },
        tracks: {
          allById: {}
        },
        library: {
          latest: [],
          latestAlbumId: '0'
        }
      });
      const expectedActions = [
        {
          type: ARTIST_SAVE_RESPONSE,
          artist: artists[0]
        },
        {
          type: TRACK_GET_LIST_RESPONSE,
          results: tracks
        },
        {
          type: ALBUM_SAVE_RESPONSE,
          album: { ...albums[0], _id: '1', artist: '1' }
        },
        {
          type: LIBRARY_ADD_TO_LATEST_ALBUMS,
          albums: [{ ...albums[0], _id: '1', artist: '1' }]
        },
        {
          type: ALBUM_GET_LIST_RESPONSE,
          results: [{ ...albums[0], _id: '1', artist: '1' }]
        }
      ];
      await importAlbum({
        album: { ...albums[0], _id: null },
        artist: artists[0],
        tracks
      })(store.dispatch, store.getState);
      expectedActions.forEach(
        action => expect(store.getActions()).toContainEqual(action)
      );
    });

    it('should update existing artist if artist name from params exists, and it has no id', async () => {
      const store = mockStore({
        albums: {
          allById: {}
        },
        artists: {
          allById: toObj(artists),
          latestArtistId: '4'
        },
        tracks: {
          allById: {}
        },
        library: {
          latest: [],
          latestAlbumId: '0'
        }
      });
      const expectedActions = [
        {
          type: ARTIST_SAVE_RESPONSE,
          artist: artists[0]
        },
        {
          type: TRACK_GET_LIST_RESPONSE,
          results: tracks
        },
        {
          type: ALBUM_SAVE_RESPONSE,
          album: { ...albums[0], _id: '1', artist: '1' }
        },
        {
          type: LIBRARY_ADD_TO_LATEST_ALBUMS,
          albums: [{ ...albums[0], _id: '1', artist: '1' }]
        },
        {
          type: ALBUM_GET_LIST_RESPONSE,
          results: [{ ...albums[0], _id: '1', artist: '1' }]
        }
      ];
      await importAlbum({
        album: { ...albums[0], _id: null },
        artist: { ...artists[0], _id: null },
        tracks
      })(store.dispatch, store.getState);
      expectedActions.forEach(
        action => expect(store.getActions()).toContainEqual(action)
      );
    });

    it('should import album from V/A', async () => {
      const store = mockStore({
        albums: {
          allById: {}
        },
        artists: {
          allById: toObj(artists),
          latestArtistId: '4'
        },
        tracks: {
          allById: {}
        },
        library: {
          latest: [],
          latestAlbumId: '0'
        }
      });
      const expectedActions = [
        {
          type: TRACK_GET_LIST_RESPONSE,
          results: tracks
        },
        {
          type: ALBUM_SAVE_RESPONSE,
          album: { ...albums[0], _id: '1', artist: VARIOUS_ARTISTS_ID, isAlbumFromVA: true }
        },
        {
          type: LIBRARY_ADD_TO_LATEST_ALBUMS,
          albums: [{ ...albums[0], _id: '1', artist: VARIOUS_ARTISTS_ID, isAlbumFromVA: true }]
        },
        {
          type: ALBUM_GET_LIST_RESPONSE,
          results: [{ ...albums[0], _id: '1', artist: VARIOUS_ARTISTS_ID, isAlbumFromVA: true }]
        }
      ];
      await importAlbum({
        album: { ...albums[0], _id: null, isAlbumFromVA: true },
        artist: getDefaultArtist(),
        tracks
      })(store.dispatch, store.getState);
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
        artists: {
          allById: toObj(artists)
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
          type: ALBUM_DELETE_LIST_RESPONSE,
          albums: [albums[0]]
        },
        {
          type: LIBRARY_GET_LATEST_RESPONSE,
          results: [albums[1]]
        },
        {
          type: PLAYER_UPDATE_QUEUE,
          queue: [albums[1]._id]
        }
      ];
      await removeAlbums([albums[0]._id])(store.dispatch, store.getState);
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
        artists: {
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
        artists: {
          allById: toObj(artists)
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
          type: ALBUM_DELETE_LIST_RESPONSE,
          albums: [albums[0]]
        },
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
      await removeAlbums([albums[0]._id])(store.dispatch, store.getState);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('library reducer', () => {
  const initialState = {
    latest: null as Album['_id'][],
    latestAlbumId: null as Album['_id'],
    loadingLatest: false
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as LibraryActionTypes))
      .toEqual(initialState);
  });

  it('should handle LIBRARY_GET_LATEST_REQUEST', () => {
    expect(reducer(initialState, {
      type: LIBRARY_GET_LATEST_REQUEST
    })).toEqual({
      latest: null,
      latestAlbumId: null,
      loadingLatest: true
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
      loadingLatest: false
    });

    expect(reducer(initialState, {
      type: LIBRARY_GET_LATEST_RESPONSE,
      results: []
    })).toEqual({
      latest: [],
      latestAlbumId: '0',
      loadingLatest: false
    });
  });

  it('should handle LIBRARY_ADD_TO_LATEST_ALBUMS', () => {
    expect(reducer(initialState, {
      type: LIBRARY_ADD_TO_LATEST_ALBUMS,
      albums
    })).toEqual({
      latest: albums.map(({ _id }) => _id),
      latestAlbumId: `${Math.max(...albums.map(({ _id }) => +_id))}`,
      loadingLatest: false
    });
  });
});
