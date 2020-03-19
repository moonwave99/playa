import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { albums, artists } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
import reducer, {
  CoverActionTypes,
  CoverState,
  getCoverRequest,
  getCoverFromUrlRequest,
  COVER_GET_REQUEST,
  COVER_GET_RESPONSE
} from './cover';

import { AlbumTypes } from './album';

describe('cover actions', () => {
  describe('getCoverRequest', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({
        covers: {
          allById: {}
        },
        artists: {
          allById: toObj(artists)
        }
      });
      const album = albums[0];
      await getCoverRequest(album)(store.dispatch, store.getState);
      expect(store.getActions()).toEqual([
        { type: COVER_GET_RESPONSE, album, path: '/path/to/cover' },
      ]);
    });
    it('should dispatch nothing if cover is already present in store', async () => {
      const store = mockStore({
        covers: {
          allById: {
            '1': '/path/to/cover'
          }
        },
        artists: {
          allById: toObj(artists)
        }
      });
      const album = albums[0];
      await getCoverRequest(album)(store.dispatch, store.getState);
      expect(store.getActions()).toHaveLength(0);
    });
    it('should dispatch nothing if album should not display cover', async () => {
      const store = mockStore({
        covers: {
          allById: {},
        },
        artists: {
          allById: toObj(artists)
        }
      });
      const album = { ...albums[0], type: AlbumTypes.Remix };
      await getCoverRequest(album)(store.dispatch, store.getState);
      expect(store.getActions()).toHaveLength(0);
    });
  });
  describe('getCoverFromUrlRequest', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({});
      const album = albums[0];
      const url = '/path/to/cover';
      await getCoverFromUrlRequest(album, url, 123)(store.dispatch);
      expect(store.getActions()).toEqual([
        { type: COVER_GET_RESPONSE, album, path: '/path/to/cover?123' },
      ]);
    });
    it('should dispatch nothing if album should not display cover', async () => {
      const store = mockStore({});
      const album = { ...albums[0], type: AlbumTypes.Remix };
      const url = '/path/to/cover';
      await getCoverFromUrlRequest(album, url)(store.dispatch);
      expect(store.getActions()).toHaveLength(0);
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
