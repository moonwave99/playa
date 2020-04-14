import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { ApplicationState } from '../store';
import { toObj } from '../../utils/storeUtils';
import { tracks } from '../../../../test/testFixtures';

import reducer, {
  TrackActionTypes,
  TrackState,
  getTrackListRequest,
  getTrackListResponse,
  TRACK_GET_LIST_REQUEST,
  TRACK_GET_LIST_RESPONSE,
  selectors
} from './track';

describe('track actions', () => {
  describe('getTrackListRequest', () => {
    it('should dispatch getTrackListRequest request', async () => {
      const store = mockStore({});
      await getTrackListRequest(tracks.map(x => x._id))(store.dispatch);
      expect(store.getActions()).toEqual([{
        type: TRACK_GET_LIST_RESPONSE,
        results: tracks
      }]);
    });
  });

  describe('getTrackListResponse', () => {
    it('should dispatch getTrackListResponse request', () => {
      const dispatch = jest.fn();
      getTrackListResponse(tracks)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: TRACK_GET_LIST_RESPONSE,
        results: tracks
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

describe('track selectors', () => {
  const state = {
    tracks: {
      allById: toObj(tracks)
    }
  } as ApplicationState;
  describe('state', () => {
    it('should return the tracks state', () => {
      const selection = selectors.state(state);
      expect(selection).toEqual(state.tracks);
    });
  });

  describe('allById', () => {
    it('should return tracks.allById', () => {
      const selection = selectors.allById(state);
      expect(selection).toEqual(state.tracks.allById);
    });
  });

  describe('findById', () => {
    it('should find a track by id', () => {
      const selection = selectors.findById(state, tracks[0]._id);
      expect(selection).toEqual(tracks[0]);
    });
  });

  describe('findByList', () => {
    it('should return tracks contained in given id list', () => {
      const selection = selectors.findByList(state, [tracks[0]._id, tracks[1]._id]);
      expect(selection).toEqual([tracks[0], tracks[1]]);
    });
  });
});
