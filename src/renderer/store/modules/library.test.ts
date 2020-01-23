import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { albums } from '../../../../test/fixtures';
import { Album, ALBUM_GET_LIST_RESPONSE } from './album';

const mockStore = configureStore([thunk]);

import reducer, {
  LibraryActionTypes,
  getLatestRequest,
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
      const actualActions = store.getActions();
      expect(actualActions).toEqual(expectedActions);
    });
  });
  describe('removeAlbums', () => {
    it('should dispatch LIBRARY_GET_LATEST_RESPONSE', async () => {
      const store = mockStore({
        library: {
          latest: albums
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

      const actualActions = store.getActions();
      expect(actualActions).toEqual(expectedActions);
    });
  });
});

describe('library reducer', () => {
  const initialState = {
    latest: [] as Album[],
    latestAlbumID: null as Album['_id']
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
      latestAlbumID: null
    });
  });

  it('should handle LIBRARY_GET_LATEST_RESPONSE', () => {
    const results = albums;
    expect(reducer(initialState, {
      type: LIBRARY_GET_LATEST_RESPONSE,
      results
    })).toEqual({
      latest: albums,
      latestAlbumID: albums[1]._id
    });
  });
});
