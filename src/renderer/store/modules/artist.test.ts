import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { artists } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';

import reducer, {
  Artist,
  ArtistActionTypes,
  ArtistState,
  getAllArtistsRequest,
  saveArtistRequest,
  deleteArtistRequest,
  ARTIST_GET_ALL_REQUEST,
  ARTIST_GET_ALL_RESPONSE,
  ARTIST_SAVE_REQUEST,
  ARTIST_SAVE_RESPONSE,
  ARTIST_DELETE_REQUEST,
  ARTIST_DELETE_RESPONSE
} from './artist';

describe('artist actions', () => {
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

describe('artist reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as ArtistActionTypes)).toEqual({
      allById: {},
      isLoading: false,
      latestArtistId: null as Artist['_id']
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
      isLoading: false,
      latestArtistId: '4'
    });
  });

  it('should handle ARTIST_SAVE_REQUEST', () => {
    expect(reducer({} as ArtistState, {
      type: ARTIST_SAVE_REQUEST,
      artist: artists[0]
    })).toEqual({});
  });

  it('should handle ARTIST_SAVE_RESPONSE', () => {
    const initialState = {
      allById: {
        '1': artists[0],
        '2': artists[1]
      },
      isLoading: false,
      latestArtistId: '2'
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
      isLoading: false,
      latestArtistId: '2'
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
      isLoading: false,
      latestArtistId: '2'
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
