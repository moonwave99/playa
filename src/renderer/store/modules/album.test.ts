import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { toObj } from '../../utils/storeUtils';
import { albums } from '../../../../test/fixtures';

const mockStore = configureStore([thunk]);

import reducer, {
  AlbumActionTypes,
  AlbumState,
  getAlbumListRequest,
  getAlbumListResponse,
  getAlbumContentRequest,
  getAlbumContentResponse,
  reloadAlbumContent,
  ALBUM_GET_LIST_REQUEST,
  ALBUM_GET_LIST_RESPONSE,
  ALBUM_GET_CONTENT_REQUEST,
  ALBUM_GET_CONTENT_RESPONSE
} from './album';

import { Track, TRACK_GET_LIST_RESPONSE } from './track';

describe('album actions', () => {
  describe('getAlbumListRequest', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({});
      const expectedActions = [
        { type: ALBUM_GET_LIST_RESPONSE }
      ];
      await getAlbumListRequest(['1', '2'])(store.dispatch);
      const actualActions = store.getActions();
      expect(actualActions).toEqual(expectedActions);
    });
  });

  describe('getAlbumListResponse', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({});
      const expectedActions = [
        { type: ALBUM_GET_LIST_RESPONSE, results: albums }
      ];
      await getAlbumListResponse(albums)(store.dispatch);
      const actualActions = store.getActions();
      expect(actualActions).toEqual(expectedActions);
    });
  });

  describe('getAlbumContentRequest', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({});
      const album = albums[0];
      const expectedActions = [
        { type: ALBUM_GET_CONTENT_RESPONSE, album }
      ];
      await getAlbumContentRequest(album)(store.dispatch);
      const actualActions = store.getActions();
      expect(actualActions).toEqual(expectedActions);
    });
  });

  describe('getAlbumContentResponse', () => {
    it('should dispatch expected actions', () => {
      const dispatch = jest.fn();
      const album = albums[0];
      getAlbumContentResponse(album)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: ALBUM_GET_CONTENT_RESPONSE,
        album
      });
    });
  });

  describe('reloadAlbumContent', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({});
      const album = albums[0];
      const expectedActions = [
        {
          type: ALBUM_GET_CONTENT_RESPONSE,
          album
        },
        {
          type: TRACK_GET_LIST_RESPONSE,
          results: undefined as Track[]
        }
      ];
      await reloadAlbumContent(album)(store.dispatch);
      const actualActions = store.getActions();
      expect(actualActions).toEqual(expectedActions);
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
