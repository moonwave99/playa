import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { albums } from '../../../../test/testFixtures';
import { Album } from './album';

import reducer, {
  SearchActionTypes,
  SearchState,
  searchRequest,
  SEARCH_REQUEST,
  SEARCH_RESPONSE
} from './search';

import {
  ALBUM_GET_LIST_RESPONSE
} from './album';

describe('search actions', () => {
  describe('searchRequest', () => {
    it('should dispatch searchAlbumsRequest request', async () => {
      const store = mockStore({});
      const query = '#!q';
      await searchRequest(query)(store.dispatch);
      expect(store.getActions()).toEqual([
        {
          type: SEARCH_REQUEST,
          query
        },
        {
          type: ALBUM_GET_LIST_RESPONSE,
          results: albums
        },
        {
          type: SEARCH_RESPONSE,
          results: albums,
          query
        }
      ]);
    });
  });
});

describe('search reducer', () => {
  const initialState = {
    results: [] as Album[],
    isSearching: false
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as SearchActionTypes))
      .toEqual(initialState);
  });

  it('should handle SEARCH_REQUEST', () => {
    const query = '#!q';
    expect(reducer({} as SearchState, {
      type: SEARCH_REQUEST,
      query
    })).toEqual({
      results: [],
      isSearching: true,
    });
  });

  it('should handle SEARCH_RESPONSE', () => {
    const results = albums;
    const query = '#!q';
    expect(reducer(initialState, {
      type: SEARCH_RESPONSE,
      results,
      query
    })).toEqual({
      results,
      isSearching: false
    });
  });
});
