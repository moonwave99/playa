import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { playlists } from '../../../../test/testFixtures';
import reducer, {
  Playlist,
  PlaylistActionTypes,
  PlaylistState,
  getPlaylistRequest,
  getAllPlaylistsRequest,
  savePlaylistRequest,
  deletePlaylistRequest,
  deletePlaylistListRequest,
  PLAYLIST_GET_REQUEST,
  PLAYLIST_GET_RESPONSE,
  PLAYLIST_GET_ALL_REQUEST,
  PLAYLIST_GET_ALL_RESPONSE,
  PLAYLIST_SAVE_REQUEST,
  PLAYLIST_SAVE_RESPONSE,
  PLAYLIST_DELETE_REQUEST,
  PLAYLIST_DELETE_RESPONSE,
  PLAYLIST_DELETE_LIST_REQUEST,
  PLAYLIST_DELETE_LIST_RESPONSE
} from './playlist';

describe('playlist actions', () => {
  describe('getPlaylistRequest', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({
        playlists: { allById: {}},
        albums: { allById: {}},
      });
      await getPlaylistRequest('1')(store.dispatch, store.getState);
      expect(store.getActions()).toEqual([
        {
          type: PLAYLIST_GET_REQUEST,
          id: '1'
        },
        {
          type: PLAYLIST_GET_RESPONSE,
          playlist: playlists[0]
        }
      ]);
    });
  });

  describe('getAllPlaylistsRequest', () => {
    it('should dispatch PLAYLIST_GET_ALL_RESPONSE', async () => {
      const store = mockStore({});
      await getAllPlaylistsRequest()(store.dispatch);
      expect(store.getActions()).toEqual([{
        type: PLAYLIST_GET_ALL_RESPONSE,
        playlists
      }]);
    });
  });

  describe('savePlaylistRequest', () => {
    it('should dispatch PLAYLIST_SAVE_REQUEST', async () => {
      const store = mockStore({});
      const playlist = playlists[0];
      await savePlaylistRequest(playlist)(store.dispatch);
      expect(store.getActions()).toEqual([{
        type: PLAYLIST_SAVE_RESPONSE,
        playlist
      }]);
    });
  });

  describe('deletePlaylistRequest', () => {
    it('should dispatch PLAYLIST_DELETE_RESPONSE', async () => {
      const store = mockStore({});
      const playlist = playlists[0];
      await deletePlaylistRequest(playlist)(store.dispatch);
      expect(store.getActions()).toEqual([{
        type: PLAYLIST_DELETE_RESPONSE,
        playlist
      }]);
    });
  });

  describe('deletePlaylistListRequest', () => {
    it('should dispatch PLAYLIST_DELETE_LIST_RESPONSE', async () => {
      const store = mockStore({});
      await deletePlaylistListRequest(playlists)(store.dispatch);
      expect(store.getActions()).toEqual([{
        type: PLAYLIST_DELETE_LIST_RESPONSE,
        playlists
      }]);
    });
  });
});

describe('playlist reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as PlaylistActionTypes)).toEqual({
      allById: {},
      isLoading: false
    });
  });

  it('should handle PLAYLIST_GET_REQUEST', () => {
    expect(reducer({} as PlaylistState, {
      type: PLAYLIST_GET_REQUEST,
      id: '1'
    })).toEqual({
      isLoading: true
    });
  });

  it('should handle PLAYLIST_GET_ALL_REQUEST', () => {
    expect(reducer({} as PlaylistState, {
      type: PLAYLIST_GET_ALL_REQUEST
    })).toEqual({});
  });

  it('should handle PLAYLIST_GET_ALL_RESPONSE', () => {
    expect(reducer({} as PlaylistState, {
      type: PLAYLIST_GET_ALL_RESPONSE,
      playlists
    })).toEqual({
      allById: {
        "1": playlists[0],
        "2": playlists[1]
      }
    });
  });

  it('should handle PLAYLIST_SAVE_REQUEST', () => {
    expect(reducer({} as PlaylistState, {
      type: PLAYLIST_SAVE_REQUEST,
      playlist: playlists[0]
    })).toEqual({});
  });

  it('should handle PLAYLIST_SAVE_RESPONSE', () => {
    const initialState = {
      allById: {
        "1": playlists[0],
        "2": playlists[1]
      },
      isLoading: false
    };

    const updatedPlaylist = { ...playlists[0], title: 'Updated Title' };
    expect(reducer(initialState, {
      type: PLAYLIST_SAVE_RESPONSE,
      playlist: updatedPlaylist
    })).toEqual({
      allById: {
        "1": updatedPlaylist,
        "2": playlists[1]
      },
      isLoading: false
    });
  });

  it('should handle PLAYLIST_DELETE_REQUEST', () => {
    expect(reducer({} as PlaylistState, {
      type: PLAYLIST_DELETE_REQUEST,
      playlist: playlists[0]
    })).toEqual({});
  });

  describe('should handle PLAYLIST_DELETE_RESPONSE', () => {
    const initialState = {
      allById: {
        "1": playlists[0],
        "2": playlists[1]
      },
      isLoading: false
    };

    it('should remove playlist by given id if found', () => {
      expect(reducer(initialState, {
        type: PLAYLIST_DELETE_RESPONSE,
        playlist: playlists[0]
      })).toEqual({
        ...initialState,
        allById: {
          "2": playlists[1]
        }
      });
    });

    it('should leave state unchanged if playlist is not found', () => {
      expect(reducer(initialState, {
        type: PLAYLIST_DELETE_RESPONSE,
        playlist: { _id: '666' } as Playlist
      })).toEqual(initialState);
    });
  });

  it('should handle PLAYLIST_DELETE_LIST_REQUEST', () => {
    expect(reducer({} as PlaylistState, {
      type: PLAYLIST_DELETE_LIST_REQUEST,
      playlists
    })).toEqual({});
  });

  it('should handle PLAYLIST_DELETE_LIST_RESPONSE', () => {
    const initialState = {
      allById: {
        "1": playlists[0],
        "2": playlists[1]
      },
      isLoading: false
    };
    expect(reducer(initialState, {
      type: PLAYLIST_DELETE_LIST_RESPONSE,
      playlists
    })).toEqual({
      allById: {},
      isLoading: false
    });
  });
});
