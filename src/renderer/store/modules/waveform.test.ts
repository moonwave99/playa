import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { tracks } from '../../../../test/fixtures';
const mockStore = configureStore([thunk]);

import reducer, {
  WaveformActionTypes,
  WaveformState,
  getWaveformRequest,
  WAVEFORM_GET_REQUEST,
  WAVEFORM_GET_RESPONSE
} from './waveform';

describe('waveform actions', () => {
  describe('getWaveformRequest', () => {
    it('should dispatch getWaveformRequest request', async () => {
      const store = mockStore({});
      const expectedActions = [
        {
          type: WAVEFORM_GET_RESPONSE,
          track: tracks[0]
        }
      ];
      await getWaveformRequest(tracks[0])(store.dispatch);
      const actualActions = store.getActions();
      expect(actualActions).toEqual(expectedActions);
    });
  });
});

describe('cover reducer', () => {
  const initialState = {
    allById: {}
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as WaveformActionTypes))
      .toEqual(initialState);
  });

  it('should handle WAVEFORM_GET_REQUEST', () => {
    expect(reducer({} as WaveformState, {
      type: WAVEFORM_GET_REQUEST,
      track: tracks[0]
    })).toEqual({});
  });

  it('should handle WAVEFORM_GET_RESPONSE', () => {
    const path = '/path/to/waveform.svg';
    expect(reducer(initialState, {
      type: WAVEFORM_GET_RESPONSE,
      path,
      track: tracks[0]
    })).toEqual({
      ...initialState,
      allById: { '1': path }
    });
  });
});
