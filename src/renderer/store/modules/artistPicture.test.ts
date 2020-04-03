import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { artists } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
import reducer, {
  ArtistPictureActionTypes,
  ArtistPictureState,
  getArtistPictureRequest,
  getArtistPictureFromUrlRequest,
  ARTIST_PICTURE_GET_REQUEST,
  ARTIST_PICTURE_GET_RESPONSE
} from './artistPicture';

describe('artistPicture actions', () => {
  describe('getArtistPictureRequest', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({
        artistPictures: {
          allById: {}
        },
        artists: {
          allById: toObj(artists)
        }
      });
      const artist = artists[0];
      await getArtistPictureRequest(artist)(store.dispatch, store.getState);
      expect(store.getActions()).toEqual([
        { type: ARTIST_PICTURE_GET_RESPONSE, artist, path: '/path/to/artistPicture' },
      ]);
    });

    it('should dispatch nothing if artistPicture is already present in store', async () => {
      const store = mockStore({
        artistPictures: {
          allById: {
            '1': '/path/to/artistPicture'
          }
        },
        artists: {
          allById: toObj(artists)
        }
      });
      const artist = artists[0];
      await getArtistPictureRequest(artist)(store.dispatch, store.getState);
      expect(store.getActions()).toHaveLength(0);
    });

  });
  describe('getArtistPictureFromUrlRequest', () => {
    it('should dispatch expected actions', async () => {
      const store = mockStore({});
      const artist = artists[0];
      const url = '/path/to/artistPicture';
      await getArtistPictureFromUrlRequest(artist, url, 123)(store.dispatch);
      expect(store.getActions()).toEqual([
        { type: ARTIST_PICTURE_GET_RESPONSE, artist, path: '/path/to/artistPicture?123' },
      ]);
    });
  });
});

describe('artistPicture reducer', () => {
  const initialState = {
    allById: {}
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as ArtistPictureActionTypes))
      .toEqual(initialState);
  });

  it('should handle ARTIST_PICTURE_GET_REQUEST', () => {
    expect(reducer({} as ArtistPictureState, {
      type: ARTIST_PICTURE_GET_REQUEST,
      artist: artists[0]
    })).toEqual({});
  });

  it('should handle ARTIST_PICTURE_GET_RESPONSE', () => {
    const path = '/path/to/artistPicture.jpg';
    expect(reducer(initialState, {
      type: ARTIST_PICTURE_GET_RESPONSE,
      path,
      artist: artists[0]
    })).toEqual({
      ...initialState,
      allById: { '1': path }
    });
  });
});
