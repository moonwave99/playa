import { tracks } from '../../../../test/fixtures';

import reducer, {
  WaveformActionTypes,
  WaveformState,
  getWaveformRequest,
  WAVEFORM_GET_REQUEST,
  WAVEFORM_GET_RESPONSE
} from './waveform';

describe('waveform actions', () => {
  describe('getWaveformRequest', () => {
    it.skip('should dispatch getWaveformRequest request', () => {
      const dispatch = jest.fn();
      getWaveformRequest(tracks[0])(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: WAVEFORM_GET_REQUEST,
        track: tracks[0]
      });
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
