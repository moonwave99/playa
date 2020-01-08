import { albums } from '../../../../test/fixtures';

import reducer, {
  Album,
  AlbumActionTypes,
  AlbumState,
  searchAlbumsRequest,
  searchAlbumsResponse,
  getAlbumListRequest,
  getAlbumListResponse,
  ALBUM_SEARCH_REQUEST,
  ALBUM_SEARCH_RESPONSE,
  ALBUM_GET_LIST_REQUEST,
  ALBUM_GET_LIST_RESPONSE
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

  describe('searchAlbumsResponse', () => {
    it('dispatches a searchAlbumsResponse request', () => {
      const dispatch = jest.fn();
      const results: Album[] = [];
      searchAlbumsResponse(results)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: ALBUM_SEARCH_RESPONSE,
        results
      });
    });
  });

  describe('getAlbumListRequest', () => {
    it('dispatches a getAlbumListRequest request', () => {
      const dispatch = jest.fn();
      getAlbumListRequest(['1', '2'])(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: ALBUM_GET_LIST_REQUEST,
        ids: ['1', '2']
      });
    });
  });

  describe('getAlbumListResponse', () => {
    it('dispatches a getAlbumListResponse request', () => {
      const dispatch = jest.fn();
      const results: Album[] = [];
      getAlbumListResponse(results)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: ALBUM_GET_LIST_RESPONSE,
        results
      });
    });
  });
});

describe('album reducer', () => {
  const initialState = {
    searchResults: [] as Album[],
    currentList: [] as Album[]
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as AlbumActionTypes))
      .toEqual(initialState);
  });

  it('should handle ALBUM_SEARCH_REQUEST', () => {
    expect(reducer({} as AlbumState, {
      type: ALBUM_SEARCH_REQUEST,
      query: '#!q'
    })).toEqual({});
  });

  it('should handle ALBUM_SEARCH_RESPONSE', () => {
    const results = albums;
    expect(reducer(initialState, {
      type: ALBUM_SEARCH_RESPONSE,
      results
    })).toEqual({
      ...initialState,
      searchResults: results
    });
  });
});
