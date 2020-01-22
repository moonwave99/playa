import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { albums } from '../../../../test/fixtures';
import { Album, ALBUM_GET_LIST_RESPONSE } from './album';

const mockStore = configureStore([thunk]);

import reducer, {
  LibraryActionTypes,
  getLatestRequest,
  LIBRARY_GET_LATEST_REQUEST,
  LIBRARY_GET_LATEST_RESPONSE
} from './library';

describe('library actions', () => {
  describe('getLatestRequest', () => {
    it('should dispatch albumGetList and libraryGetLatest actions', async () => {
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
});

describe('library reducer', () => {
  const initialState = {
    latest: [] as Album[],
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as LibraryActionTypes))
      .toEqual(initialState);
  });

  it('should handle LIBRARY_GET_LATEST_REQUEST', () => {
    expect(reducer(initialState, {
      type: LIBRARY_GET_LATEST_REQUEST
    })).toEqual({
      latest: []
    });
  });

  it('should handle LIBRARY_GET_LATEST_RESPONSE', () => {
    const results = albums;
    expect(reducer(initialState, {
      type: LIBRARY_GET_LATEST_RESPONSE,
      results
    })).toEqual({
      latest: albums
    });
  });
});
