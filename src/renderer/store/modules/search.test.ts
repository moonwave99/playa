import { albums } from '../../../../test/fixtures';
import { Album } from './album';

import reducer, {
  SearchActionTypes,
  SearchState,
  searchRequest,
  searchResponse,
  SEARCH_REQUEST,
  SEARCH_RESPONSE
} from './search';

describe('search actions', () => {
  describe('searchRequest', () => {
    it('should dispatch searchAlbumsRequest request', () => {
      const dispatch = jest.fn();
      searchRequest('#!q')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: SEARCH_REQUEST,
        query: '#!q'
      });
    });
  });

  describe('searchAlbumsResponse', () => {
    it('should dispatch searchAlbumsResponse request', () => {
      const dispatch = jest.fn();
      const query = '#!q';
      const results: Album[] = [];
      searchResponse(results, query)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: SEARCH_RESPONSE,
        results,
        query
      });
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
