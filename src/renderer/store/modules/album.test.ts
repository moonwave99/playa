import { albums } from '../../../../test/fixtures';

import reducer, {
  Album,
  AlbumActionTypes,
  AlbumState,
  searchAlbumsRequest,
  searchAlbumsResults,
  ALBUM_SEARCH_REQUEST,
  ALBUM_SEARCH_RESULTS
} from './album';

describe('album actions', () => {
  describe('searchAlbumsRequest', () => {
    it('dispatches a searchAlbumsRequest request', () => {
      const dispatch = jest.fn();
      searchAlbumsRequest('#!q')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: ALBUM_SEARCH_REQUEST,
        query: '#!q'
      });
    });
  });

  describe('searchAlbumsResults', () => {
    it('dispatches a searchAlbumsResults request', () => {
      const dispatch = jest.fn();
      const results: Album[] = [];
      searchAlbumsResults(results)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: ALBUM_SEARCH_RESULTS,
        results
      });
    });
  });
});

describe('album reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as AlbumActionTypes))
      .toEqual({ searchResults: [] as Album[] });
  });

  it('should handle ALBUM_SEARCH_REQUEST', () => {
    expect(reducer({} as AlbumState, {
      type: ALBUM_SEARCH_REQUEST,
      query: '#!q'
    })).toEqual({});
  });

  it('should handle ALBUM_SEARCH_RESULTS', () => {
    const results = albums;
    expect(reducer({ searchResults: [] } as AlbumState, {
      type: ALBUM_SEARCH_RESULTS,
      results
    })).toEqual({
      searchResults: results
    });
  });
});
