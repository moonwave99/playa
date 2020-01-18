import { toObj } from '../../utils/storeUtils';
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
    it.skip('should dispatch getTrackListRequest request', () => {
      const dispatch = jest.fn();
      getTrackListRequest(['1', '2'])(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: TRACK_GET_LIST_REQUEST,
        ids: ['1', '2']
      });
    });
  });

  describe('getTrackListResponse', () => {
    it('should dispatch getTrackListResponse request', () => {
      const dispatch = jest.fn();
      const results: Track[] = [];
      getTrackListResponse(results)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: TRACK_GET_LIST_RESPONSE,
        results
      });
    });
  });
});

describe('track reducer', () => {
  const initialState = {
    allById: {}
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as TrackActionTypes))
      .toEqual(initialState);
  });

  it('should handle TRACK_GET_LIST_REQUEST', () => {
    expect(reducer({} as TrackState, {
      type: TRACK_GET_LIST_REQUEST,
      ids: []
    })).toEqual({});
  });

  it('should handle TRACK_GET_LIST_RESPONSE', () => {
    const results = tracks;
    expect(reducer(initialState, {
      type: TRACK_GET_LIST_RESPONSE,
      results,
    })).toEqual({
      ...initialState,
      allById: { ...initialState.allById, ...toObj(tracks)}
    });
  });
});
