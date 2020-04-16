import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

import { tracks } from '../../../../test/testFixtures';
import { EntityHashMap } from '../../utils/storeUtils';
import reducer, {
  WaveformActionTypes,
  WaveformState,
  getWaveformRequest,
  selectors,
  WAVEFORM_GET_REQUEST,
  WAVEFORM_GET_RESPONSE
} from './waveform';

import { ApplicationState } from '../store';

jest.mock('../../lib/waveform', () => {
  return {
    Waveform: class{
      path: string;
      constructor(options: { path: string }) {
        this.path = options.path;
      }
      getSVGPath(): string { return this.path === '' ? null : 'data'; }
      async load(): Promise<void> { return }
    }
  }
});

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
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should dispatch nothing if waveform content could not be retrieved', async () => {
      const store = mockStore({});
      await getWaveformRequest({
        ...tracks[0],
        path: ''
      })(store.dispatch);
      expect(store.getActions()).toEqual([]);
    });
  });
});

describe('waveform reducer', () => {
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
      allById: { [tracks[0]._id]: path }
    });
  });
});

describe('waveform selectors', () => {
  const state = {
    waveforms: {
      allById: {
        '1': '/path/to/waveform'
      } as EntityHashMap<string>
    }
  } as ApplicationState;
  describe('state', () => {
    it('should return the waveforms state', () => {
      const selection = selectors.state(state);
      expect(selection).toEqual(state.waveforms);
    });
  });

  describe('allById', () => {
    it('should return waveforms.allById', () => {
      const selection = selectors.allById(state);
      expect(selection).toEqual(state.waveforms.allById);
    });
  });

  describe('findById', () => {
    it('should find an waveform by id', () => {
      const selection = selectors.findById(state, '1');
      expect(selection).toEqual('/path/to/waveform');
    });
  });
});
