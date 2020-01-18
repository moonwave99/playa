import { toObj } from '../../utils/storeUtils';
import { albums } from '../../../../test/fixtures';

import reducer, {
  AlbumActionTypes,
  AlbumState,
  getAlbumListRequest,
  getAlbumContentRequest,
  getAlbumContentResponse,
  ALBUM_GET_LIST_REQUEST,
  ALBUM_GET_LIST_RESPONSE,
  ALBUM_GET_CONTENT_REQUEST,
  ALBUM_GET_CONTENT_RESPONSE
} from './album';

describe('album actions', () => {
  describe('getAlbumListRequest', () => {
    it.skip('should dispatch getAlbumListRequest request', () => {
      const dispatch = jest.fn();
      getAlbumListRequest(['1', '2'])(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: ALBUM_GET_LIST_REQUEST,
        ids: ['1', '2']
      });
    });
  });

  describe('getAlbumContentRequest', () => {
    it.skip('should dispatch getAlbumContentRequest request', () => {
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
    allById: {}
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as AlbumActionTypes))
      .toEqual(initialState);
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
        ...allById,
        '1': updatedAlbum
      }
    });
  });
});
