import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { albums, artists } from '../../../../test/testFixtures';
import { ApplicationState } from '../../store/store';
import { toObj } from '../../utils/storeUtils';

import { ALBUM_GET_LIST_RESPONSE } from './album';

import reducer, {
  Artist,
  ArtistActionTypes,
  ArtistState,
  VariousArtist,
  getDefaultArtist,
  getArtistReleases,
  getAllArtistsRequest,
  saveArtistRequest,
  deleteArtistRequest,
  getAlbumsByArtist,
  searchArtists,
  getArtistPictureRequest,
  getArtistPictureFromUrlRequest,
  selectors,
  ARTIST_GET_ALL_REQUEST,
  ARTIST_GET_ALL_RESPONSE,
  ARTIST_GET_LIST_RESPONSE,
  ARTIST_SAVE_REQUEST,
  ARTIST_SAVE_RESPONSE,
  ARTIST_DELETE_REQUEST,
  ARTIST_DELETE_RESPONSE
} from './artist';

describe('artist actions', () => {
  describe('getArtistReleases', () => {
    it('should dispatch ALBUM_GET_LIST_RESPONSE', async () => {
      const store = mockStore({});
      await getArtistReleases(artists[0])(store.dispatch);
      expect(store.getActions()).toEqual([{
        type: ALBUM_GET_LIST_RESPONSE,
        results: albums[0]
      }]);
    });
  });

  describe('getAllArtistsRequest', () => {
    it('should dispatch ARTIST_GET_ALL_RESPONSE', async () => {
      const store = mockStore({});
      await getAllArtistsRequest()(store.dispatch);
      expect(store.getActions()).toEqual([{
        type: ARTIST_GET_ALL_RESPONSE,
        artists
      }]);
    });
  });

  describe('saveArtistRequest', () => {
    it('should dispatch ARTIST_SAVE_REQUEST', async () => {
      const store = mockStore({});
      const artist = artists[0];
      await saveArtistRequest(artist)(store.dispatch);
      expect(store.getActions()).toEqual([{
        type: ARTIST_SAVE_RESPONSE,
        artist
      }]);
    });
  });

  describe('deleteArtistRequest', () => {
    it('should dispatch ARTIST_DELETE_RESPONSE', async () => {
      const store = mockStore({});
      const artist = artists[0];
      await deleteArtistRequest(artist)(store.dispatch);
      expect(store.getActions()).toEqual([{
        type: ARTIST_DELETE_RESPONSE,
        artist
      }]);
    });
  });
});

describe('artist selectors', () => {
  describe('getAlbumsByArtist', () => {
    const store = mockStore({
      albums: {
        allById: toObj(albums)
      },
      artists: {
        allById: toObj(artists)
      }
    });
    const selection = getAlbumsByArtist(
      store.getState() as ApplicationState,
      artists[0]._id
    );
    expect(selection).toEqual([albums[0]]);
  });

  describe('searchArtists', () => {
    const store = mockStore({
      albums: {
        allById: toObj(albums)
      },
      artists: {
        allById: toObj(artists)
      }
    });
    const selection = searchArtists(
      store.getState() as ApplicationState,
      'my'
    );
    expect(selection).toEqual([artists[1]]);
  });

  describe('getArtistPictureRequest', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({
        artists: {
          allById: toObj(artists)
        }
      });
      await getArtistPictureRequest(artists[0])(store.dispatch);
      expect(store.getActions()).toEqual([{
        type: ARTIST_SAVE_RESPONSE,
        artist: {
          ...artists[0],
          picture: '/path/to/artistPicture',
          noDiscogsResults: false
        }
      }]);
    });

    it('should dispatch nothing if artist already has a picture', async () => {
      const store = mockStore({
        artists: {
          allById: toObj(artists)
        }
      });
      await getArtistPictureRequest({
        ...artists[0],
        picture: '/path/to/artistPicture'
      })(store.dispatch);
      expect(store.getActions()).toEqual([]);
    });
  });

  describe('getArtistPictureFromUrlRequest', () => {
    it('should dispatch ARTIST_SAVE_RESPONSE', async () => {
      const store = mockStore({
        artists: {
          allById: toObj(artists)
        }
      });

      await getArtistPictureFromUrlRequest(artists[0], 'https://path/to/covers/1.jpg')(store.dispatch);
      expect(store.getActions()).toEqual([{
        type: ARTIST_SAVE_RESPONSE,
        artist: {
          ...artists[0],
          picture: '/path/to/artistPicture',
          noDiscogsResults: false
        }
      }]);
    });
  });
});

describe('artist reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as ArtistActionTypes)).toEqual({
      allById: {},
      isLoading: false
    });
  });

  it('should handle ARTIST_GET_ALL_REQUEST', () => {
    expect(reducer({} as ArtistState, {
      type: ARTIST_GET_ALL_REQUEST
    })).toEqual({ isLoading: true });
  });

  it('should handle ARTIST_GET_ALL_RESPONSE', () => {
    expect(reducer({} as ArtistState, {
      type: ARTIST_GET_ALL_RESPONSE,
      artists
    })).toEqual({
      allById: toObj(artists),
      isLoading: false
    });

    expect(reducer({} as ArtistState, {
      type: ARTIST_GET_ALL_RESPONSE,
      artists: []
    })).toEqual({
      allById: {},
      isLoading: false
    });
  });

  it('should handle ARTIST_GET_LIST_RESPONSE', () => {
    expect(reducer({} as ArtistState, {
      type: ARTIST_GET_LIST_RESPONSE,
      artists
    })).toEqual({
      allById: toObj(artists),
    });
  });

  it('should handle ARTIST_SAVE_REQUEST', () => {
    expect(reducer({} as ArtistState, {
      type: ARTIST_SAVE_REQUEST,
      artist: artists[0]
    })).toEqual({});
  });

  describe('should handle ARTIST_SAVE_RESPONSE', () => {
    it('should persist existing artist', () => {
      const initialState = {
        allById: {
          '1': artists[0],
          '2': artists[1]
        },
        isLoading: false
      };

      const updatedArtist = { ...artists[0], name: 'Updated Name' };
      expect(reducer(initialState, {
        type: ARTIST_SAVE_RESPONSE,
        artist: updatedArtist
      })).toEqual({
        allById: {
          '1': updatedArtist,
          '2': artists[1]
        },
        isLoading: false
      });
    });

    it('should persist new artist', () => {
      const initialState = {
        allById: {
          '1': artists[0]
        },
        isLoading: false
      };

      expect(reducer(initialState, {
        type: ARTIST_SAVE_RESPONSE,
        artist: artists[1]
      })).toEqual({
        allById: {
          '1': artists[0],
          '2': artists[1]
        },
        isLoading: false
      });
    });
  });

  it('should handle ARTIST_DELETE_REQUEST', () => {
    expect(reducer({} as ArtistState, {
      type: ARTIST_DELETE_REQUEST,
      artist: artists[0]
    })).toEqual({});
  });

  describe('should handle ARTIST_DELETE_RESPONSE', () => {
    const initialState = {
      allById: {
        '1': artists[0],
        '2': artists[1]
      },
      isLoading: false
    };

    it('should remove artist by given id if found', () => {
      expect(reducer(initialState, {
        type: ARTIST_DELETE_RESPONSE,
        artist: artists[0]
      })).toEqual({
        ...initialState,
        allById: {
          '2': artists[1]
        }
      });
    });

    it('should leave state unchanged if artist is not found', () => {
      expect(reducer(initialState, {
        type: ARTIST_DELETE_RESPONSE,
        artist: { _id: '666' } as Artist
      })).toEqual(initialState);
    });
  });
});

describe('artist selectors', () => {
  const state = {
    artists: {
      allById: toObj(artists)
    }
  } as ApplicationState;
  describe('state', () => {
    it('should return the artists state', () => {
      const selection = selectors.state(state);
      expect(selection).toEqual(state.artists);
    });
  });

  describe('allById', () => {
    it('should return artists.allById', () => {
      const selection = selectors.allById(state);
      expect(selection).toEqual(state.artists.allById);
    });
  });

  describe('findById', () => {
    it('should find an artist by id', () => {
      const selection = selectors.findById(state, artists[0]._id);
      expect(selection).toEqual(artists[0]);
    });
    it('should return default artist if no artist is found', () => {
      const selection = selectors.findById(state, '666');
      expect(selection).toEqual(getDefaultArtist());
    });
  });

  describe('findByList', () => {
    it('should return artists contained in given id list', () => {
      const selection = selectors.findByList(state, [artists[0]._id, artists[1]._id]);
      expect(selection).toEqual([artists[0], artists[1]]);
    });
  });

  describe('findByLetter', () => {
    it('should return artists starting by given letter', () => {
      const selection = selectors.findByLetter(state, 'a');
      expect(selection).toEqual([artists[3]]);
    });

    it('should return artists starting by numbers if given letter is #', () => {
      const selection = selectors.findByLetter(state, '#');
      expect(selection).toEqual([artists[4]]);
    });

    it('should return [VariousArtist] if given letter is V/A', () => {
      const selection = selectors.findByLetter(state, 'V/A');
      expect(selection).toEqual([VariousArtist]);
    });
  });
});
