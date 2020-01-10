import { tracks } from '../../../../test/fixtures';

import reducer, {
  Track,
  TrackActionTypes,
  TrackState,
  getTrackListRequest,
  getTrackListResponse,
  TRACK_GET_LIST_REQUEST,
  TRACK_GET_LIST_RESPONSE
} from './track';

describe('album actions', () => {
  describe('getTrackListRequest', () => {
    it('dispatches a getTrackListRequest request', () => {
      const dispatch = jest.fn();
      getTrackListRequest(['1', '2'], '1')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: TRACK_GET_LIST_REQUEST,
        ids: ['1', '2'],
        albumId: '1'
      });
    });
  });

  describe('getTrackListResponse', () => {
    it('dispatches a getTrackListResponse request', () => {
      const dispatch = jest.fn();
      const results: Track[] = [];
      getTrackListResponse(results, '1')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: TRACK_GET_LIST_RESPONSE,
        results,
        albumId: '1'
      });
    });
  });
});

describe('track reducer', () => {
  const initialState = {
    allByAlbumId: {}
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as TrackActionTypes))
      .toEqual(initialState);
  });

  it('should handle TRACK_GET_LIST_REQUEST', () => {
    expect(reducer({} as TrackState, {
      type: TRACK_GET_LIST_REQUEST,
      ids: [],
      albumId: '1'
    })).toEqual({});
  });

  it('should handle TRACK_GET_LIST_RESPONSE', () => {
    const results = tracks;
    expect(reducer(initialState, {
      type: TRACK_GET_LIST_RESPONSE,
      results,
      albumId: '1'
    })).toEqual({
      ...initialState,
      allByAlbumId: {
        '1': results
      }
    });
  });
});
