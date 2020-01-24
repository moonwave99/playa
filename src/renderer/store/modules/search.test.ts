import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { albums } from '../../../../test/fixtures';
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
      await searchRequest('#!q')(store.dispatch);
      expect(store.getActions()).toEqual([
        {
          type: ALBUM_GET_LIST_RESPONSE,
          results: albums
        },
        {
          type: SEARCH_RESPONSE,
          results: albums,
          query: '#!q'
        }
      ]);
    });
  });
});

describe('search reducer', () => {
  const initialState = {
    query: '',
    results: [] as Album[],
    isSearching: false
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as SearchActionTypes))
      .toEqual(initialState);
  });

  it('should handle SEARCH_REQUEST', () => {
    expect(reducer({} as SearchState, {
      type: SEARCH_REQUEST,
      query: '#!q'
    })).toEqual({
      results: [],
      query: '#!q',
      isSearching: true
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
      query,
      isSearching: false
    });
  });
});
