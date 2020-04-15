import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { playlists, albums } from '../../../../test/testFixtures';
import reducer, {
  Playlist,
  PlaylistActionTypes,
  PlaylistState,
  getPlaylistRequest,
  getAllPlaylistsRequest,
  savePlaylistRequest,
  deletePlaylistRequest,
  deletePlaylistListRequest,
  selectors,
  getPlaylistById,
  PLAYLIST_GET_REQUEST,
  PLAYLIST_GET_RESPONSE,
  PLAYLIST_GET_ALL_REQUEST,
  PLAYLIST_GET_ALL_RESPONSE,
  PLAYLIST_GET_LIST_RESPONSE,
  PLAYLIST_SAVE_REQUEST,
  PLAYLIST_SAVE_RESPONSE,
  PLAYLIST_DELETE_REQUEST,
  PLAYLIST_DELETE_RESPONSE,
  PLAYLIST_DELETE_LIST_REQUEST,
  PLAYLIST_DELETE_LIST_RESPONSE
} from './playlist';

import { ALBUM_GET_LIST_RESPONSE } from './album';
import { ApplicationState } from '../store';

import { EntityHashMap, toObj } from '../../utils/storeUtils';

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

    it('should request notFound albums', async () => {
      const store = mockStore({
        playlists: {
          allById: {
            '1': {
              ...playlists[0],
              albums: ['1', '2']
            }
          }
        },
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
          playlist: {
            ...playlists[0],
            albums: ['1', '2']
          }
        },
        {
          type: ALBUM_GET_LIST_RESPONSE,
          results: [albums[0], albums[1]]
        },
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
      allById: toObj(playlists)
    });
  });

  it('should handle PLAYLIST_GET_LIST_RESPONSE', () => {
    expect(reducer({} as PlaylistState, {
      type: PLAYLIST_GET_LIST_RESPONSE,
      playlists
    })).toEqual({
      allById: toObj(playlists)
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

describe('playlist selectors', () => {
  const state = {
    playlists: {
      allById: toObj(playlists)
    },
    albums: {
      allById: toObj(albums)
    }
  } as ApplicationState;
  describe('state', () => {
    it('should return the playlist state', () => {
      const selection = selectors.state(state);
      expect(selection).toEqual(state.playlists);
    });
  });

  describe('allById', () => {
    it('should return playlist.allById', () => {
      const selection = selectors.allById(state);
      expect(selection).toEqual(state.playlists.allById);
    });
  });

  describe('allByDate', () => {
    it('should return playlist sorted by date', () => {
      const selection = selectors.allByDate(state);
      expect(selection).toEqual([
        playlists[2],
        playlists[1],
        playlists[0],
      ]);
    });
  });

  describe('findById', () => {
    it('should find a playlist by id', () => {
      const selection = selectors.findById(state, playlists[0]._id);
      expect(selection).toEqual(playlists[0]);
    });
  });

  describe('recent', () => {
    it('should return recent playlists', () => {
      const selection = selectors.recent(state, 2);
      expect(selection).toEqual([
        playlists[1],
        playlists[2]
      ]);
    });
  });

  describe('withoutAlbums', () => {
    it('should return playlists not containing given list of album IDs', () => {
      const state = {
        playlists: {
          allById: {
            '1': {
              ...playlists[0],
              albums: ['1']
            },
            '2': {
              ...playlists[1],
              albums: ['2']
            },
            '3': playlists[2]
          } as EntityHashMap<Playlist>
        },
        albums: {
          allById: toObj(albums)
        }
      } as ApplicationState;
      const selection = selectors.withoutAlbums(state, ['1', '2']);
      expect(selection).toEqual([
        playlists[2]
      ]);
    });
  });

  describe('getPlaylistById', () => {
    it('should return playlist by given id', () => {
      const playlist = {
        ...playlists[0],
        albums: ['1', '2']
      };
      const state = {
        playlists: {
          allById: {
            '1': playlist
          } as EntityHashMap<Playlist>
        },
        albums: {
          allById: toObj(albums)
        }
      } as ApplicationState;
      const selection = getPlaylistById(state, '1');
      expect(selection.playlist).toEqual(playlist);
      expect(selection.albums).toEqual({
        '1': albums[0],
        '2': albums[1]
      });
    });

    it('should return no albums if playlist is empty', () => {
      const state = {
        playlists: {
          allById: toObj(playlists)
        },
        albums: {
          allById: toObj(albums)
        }
      } as ApplicationState;
      const selection = getPlaylistById(state, '1');
      expect(selection.playlist).toEqual(playlists[0]);
      expect(selection.albums).toEqual({});
    });
  });
});
