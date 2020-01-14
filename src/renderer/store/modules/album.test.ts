import { toObj } from '../../utils/storeUtils';
import { albums } from '../../../../test/fixtures';

import reducer, {
  Album,
  AlbumActionTypes,
  AlbumState,
  searchAlbumsRequest,
  searchAlbumsResponse,
  getAlbumListRequest,
  getAlbumListResponse,
  getAlbumContentRequest,
  getAlbumContentResponse,
  ALBUM_SEARCH_REQUEST,
  ALBUM_SEARCH_RESPONSE,
  ALBUM_GET_LIST_REQUEST,
  ALBUM_GET_LIST_RESPONSE,
  ALBUM_GET_CONTENT_REQUEST,
  ALBUM_GET_CONTENT_RESPONSE
} from './album';

describe('album actions', () => {
  describe('searchAlbumsRequest', () => {
    it('should dispatch searchAlbumsRequest request', () => {
      const dispatch = jest.fn();
      searchAlbumsRequest('#!q')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: ALBUM_SEARCH_REQUEST,
        query: '#!q'
      });
    });
  });

  describe('searchAlbumsResponse', () => {
    it('should dispatch searchAlbumsResponse request', () => {
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
    it('should dispatch getAlbumListRequest request', () => {
      const dispatch = jest.fn();
      getAlbumListRequest(['1', '2'])(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: ALBUM_GET_LIST_REQUEST,
        ids: ['1', '2']
      });
    });
  });

  describe('getAlbumListResponse', () => {
    it('should dispatch getAlbumListResponse request', () => {
      const dispatch = jest.fn();
      const results: Album[] = [];
      getAlbumListResponse(results)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: ALBUM_GET_LIST_RESPONSE,
        results
      });
    });
  });

  describe('getAlbumContentRequest', () => {
    it('should dispatch getAlbumContentRequest request', () => {
      const dispatch = jest.fn();
      const album = albums[0];
      getAlbumContentRequest(album)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: ALBUM_GET_CONTENT_REQUEST,
        album
      });
    });
  });

  describe('getAlbumContentResponse', () => {
    it('should dispatch getAlbumContentResponse request', () => {
      const dispatch = jest.fn();
      const album = albums[0];
      getAlbumContentResponse(album)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: ALBUM_GET_CONTENT_RESPONSE,
        album
      });
    });
  });
});

describe('album reducer', () => {
  const initialState = {
    searchResults: [] as Album[],
    allById: {}
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

  it('should handle ALBUM_GET_LIST_REQUEST', () => {
    expect(reducer({} as AlbumState, {
      type: ALBUM_GET_LIST_REQUEST,
      ids: []
    })).toEqual({});
  });

  it('should handle ALBUM_GET_LIST_RESPONSE', () => {
    const results = albums;
    expect(reducer(initialState, {
      type: ALBUM_GET_LIST_RESPONSE,
      results
    })).toEqual({
      ...initialState,
      allById: { ...initialState.allById, ...toObj(albums)}
    });
  });

  it('should handle ALBUM_GET_CONTENT_REQUEST', () => {
    const album = albums[0];
    expect(reducer({} as AlbumState, {
      type: ALBUM_GET_CONTENT_REQUEST,
      album
    })).toEqual({});
  });

  it('should handle ALBUM_GET_CONTENT_RESPONSE', () => {
    const allById = toObj(albums);
    const updatedAlbum = { ...allById['1'], tracks: ['/path/123', '/path/456'] };
    expect(reducer({
      ...initialState,
      allById
    }, {
      type: ALBUM_GET_CONTENT_RESPONSE,
      album: updatedAlbum
    })).toEqual({
      ...initialState,
      allById: {
        '1': updatedAlbum,
        ...allById
      }
    });
  });
});
