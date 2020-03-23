import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { toObj } from '../../utils/storeUtils';
import { albums, artists, tracks } from '../../../../test/testFixtures';
import reducer, {
  Album,
  AlbumActionTypes,
  AlbumState,
  getAlbumRequest,
  getAlbumListRequest,
  getAlbumListResponse,
  getAlbumContentResponse,
  saveAlbumRequest,
  reloadAlbumContent,
  editAlbum,
  updateAlbum,
  ALBUM_GET_RESPONSE,
  ALBUM_GET_LIST_REQUEST,
  ALBUM_GET_LIST_RESPONSE,
  ALBUM_GET_CONTENT_REQUEST,
  ALBUM_GET_CONTENT_RESPONSE,
  ALBUM_SAVE_RESPONSE,
  ALBUM_DELETE_RESPONSE,
  ALBUM_DELETE_LIST_RESPONSE,
  ALBUM_SET_EDITING
} from './album';

import { Artist, ARTIST_SAVE_RESPONSE } from './artist';
import { TRACK_GET_LIST_RESPONSE } from './track';
import { COVER_GET_RESPONSE } from './cover';

describe('album actions', () => {
  describe('getAlbumRequest', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({
        albums: {
          allById: {}
        },
        artists: {
          allById: toObj(artists)
        },
        tracks: {
          allById: {}
        },
        covers: {
          allById: {}
        }
      });
      const albumWithTracks = {...albums[0], tracks: [tracks[0]._id, tracks[1]._id]};
      const expectedActions = [
        { type: ALBUM_GET_RESPONSE, album: albumWithTracks },
        { type: TRACK_GET_LIST_RESPONSE, results: [tracks[0], tracks[1]] },
        { type: COVER_GET_RESPONSE, album: albumWithTracks, path: '/path/to/cover' }
      ];
      await getAlbumRequest('1')(store.dispatch, store.getState);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('getAlbumListRequest', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({
        albums: {
          allById: {}
        }
      });
      const expectedActions = [
        { type: ALBUM_GET_LIST_RESPONSE, results: albums }
      ];
      await getAlbumListRequest(['1', '2'])(store.dispatch);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('getAlbumListResponse', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({});
      const expectedActions = [
        { type: ALBUM_GET_LIST_RESPONSE, results: albums }
      ];
      await getAlbumListResponse(albums)(store.dispatch);
      expect(store.getActions()).toEqual(expectedActions);
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
          album: { ...album, tracks: [tracks[0], tracks[1]].map(x => x._id) }
        },
        {
          type: TRACK_GET_LIST_RESPONSE,
          results: [tracks[0], tracks[1]]
        }
      ];
      await reloadAlbumContent(album)(store.dispatch);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('saveAlbumRequest', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({
        albums: {
          allById: {}
        }
      });
      const album = albums[0];
      const expectedActions = [
        {
          type: ALBUM_SAVE_RESPONSE,
          album: {
            ...album,
            title: 'updated title'
          }
        }
      ];
      await saveAlbumRequest({
        ...album,
        title: 'updated title'
      })(store.dispatch);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('editAlbum', () => {
    it('should dispatch ALBUM_SET_EDITING', () => {
      const dispatch = jest.fn();
      const album = albums[0];
      editAlbum(album)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: ALBUM_SET_EDITING,
        editingAlbumId: albums[0]. _id
      });
    });
  });

  describe('updateAlbum', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({
        albums: {
          allById: {}
        },
        artists: {
          allById: {},
          latestArtistId: null
        }
      });
      const album = albums[0];
      const artist = artists[0];
      const expectedActions = [
        {
          type: ALBUM_SAVE_RESPONSE,
          album: {
            ...album,
            title: 'updated title'
          }
        }
      ];
      await updateAlbum({
        ...album,
        title: 'updated title'
      }, artist)(store.dispatch, store.getState);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should persist new artist', async () => {
      const store = mockStore({
        albums: {
          allById: {}
        },
        artists: {
          allById: {},
          latestArtistId: '4'
        }
      });
      const album = albums[0];
      const artist: Artist =  {...artists[0], _id: null };
      const expectedActions = [
        {
          type: ARTIST_SAVE_RESPONSE,
          artist: {
            ...artists[0],
            _id: '5'
          }
        },
        {
          type: ALBUM_SAVE_RESPONSE,
          album: {
            ...album,
            title: 'updated title',
            artist: '5'
          }
        }
      ];
      await updateAlbum({
        ...album,
        title: 'updated title'
      }, artist)(store.dispatch, store.getState);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('album reducer', () => {
  const initialState = {
    allById: {},
    editingAlbumId: null as Album['_id']
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

  it('should handle ALBUM_DELETE_RESPONSE', () => {
    const album = albums[0];
    expect(reducer({
      allById: toObj(albums)
    } as AlbumState, {
      type: ALBUM_DELETE_RESPONSE,
      album
    })).toEqual({
      allById: {
        [albums[1]._id]: albums[1]
      }
    });
  });

  it('should handle ALBUM_DELETE_LIST_RESPONSE', () => {
    expect(reducer({
      allById: toObj(albums)
    } as AlbumState, {
      type: ALBUM_DELETE_LIST_RESPONSE,
      albums: [albums[0]]
    })).toEqual({
      allById: {
        [albums[1]._id]: albums[1]
      }
    });
  });

  it('should handle ALBUM_SET_EDITING', () => {
    expect(reducer(initialState, {
      type: ALBUM_SET_EDITING,
      editingAlbumId: albums[0]._id
    })).toEqual({
      allById: {},
      editingAlbumId: albums[0]._id
    });

    expect(reducer({
      ...initialState,
      editingAlbumId: '1'
    }, {
      type: ALBUM_SET_EDITING,
      editingAlbumId: null
    })).toEqual({
      allById: {},
      editingAlbumId: null
    });
  });
});
