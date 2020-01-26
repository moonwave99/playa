import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { albums } from '../../../../test/fixtures';
import reducer, {
  CoverActionTypes,
  CoverState,
  getCoverRequest,
  COVER_GET_REQUEST,
  COVER_GET_RESPONSE
} from './cover';

describe('cover actions', () => {
  describe('getCoverRequest', () => {
    it('should dispatch getCoverRequest request', async () => {
      const store = mockStore({
        covers: {
          allById: {}
        }
      });
      const album = albums[0];
      await getCoverRequest(album)(store.dispatch, store.getState);
      expect(store.getActions()).toEqual([
        { type: COVER_GET_RESPONSE, album, path: '/path/to/cover' },
      ]);
    });
  });
});

describe('cover reducer', () => {
  const initialState = {
    allById: {}
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as CoverActionTypes))
      .toEqual(initialState);
  });

  it('should handle COVER_GET_REQUEST', () => {
    expect(reducer({} as CoverState, {
      type: COVER_GET_REQUEST,
      album: albums[0]
    })).toEqual({});
  });

  it('should handle COVER_GET_RESPONSE', () => {
    const path = '/path/to/cover.jpg';
    expect(reducer(initialState, {
      type: COVER_GET_RESPONSE,
      path,
      album: albums[0]
    })).toEqual({
      ...initialState,
      allById: { '1': path }
    });
  });
});
