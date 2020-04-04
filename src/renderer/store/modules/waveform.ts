import { ipcRenderer as ipc } from 'electron';
import { EntityHashMap } from '../../utils/storeUtils';
import { ApplicationState } from '../store';
import { Track } from './track';
import { Waveform } from '../../lib/waveform';
import { IPC_MESSAGES, WAVEFORM_RESOLUTION, WAVEFORM_PRECISION } from '../../../constants';

const {
  IPC_WAVEFORM_SAVE_REQUEST
} = IPC_MESSAGES;

export interface WaveformState {
  allById: EntityHashMap<string>;
}

export const selectors = {
  state: ({ waveforms }: ApplicationState): WaveformState => waveforms,
  allById: ({ waveforms }: ApplicationState): EntityHashMap<string> => waveforms.allById,
  findById: ({ waveforms }: ApplicationState, id: string): string => waveforms.allById[id]
};

export const WAVEFORM_GET_REQUEST  = 'playa/waveform/WAVEFORM_GET_REQUEST';
export const WAVEFORM_GET_RESPONSE = 'playa/waveform/WAVEFORM_GET_RESPONSE';


interface GetWaveformRequestAction {
  type: typeof WAVEFORM_GET_REQUEST;
  track: Track;
}

interface GetWaveformResponseAction {
  type: typeof WAVEFORM_GET_RESPONSE;
  track: Track;
  path: string;
}

export type WaveformActionTypes =
    GetWaveformRequestAction
  | GetWaveformResponseAction;

export const getWaveformRequest = (track: Track): Function =>
  async (dispatch: Function): Promise<void> => {
    const waveform = new Waveform({
      path: track.path,
      resolution: WAVEFORM_RESOLUTION,
      precision: WAVEFORM_PRECISION
    });
    await waveform.load();
    const waveformContent = waveform.getSVGPath();
    if (waveformContent) {
      dispatch({
        type: WAVEFORM_GET_RESPONSE,
        path: await ipc.invoke(IPC_WAVEFORM_SAVE_REQUEST, track._id, waveformContent),
        track
      });
    }
  }

const INITIAL_STATE = {
  allById: {}
};

export default function reducer(
  state: WaveformState = INITIAL_STATE,
  action: WaveformActionTypes
): WaveformState {
  switch (action.type) {
    case WAVEFORM_GET_RESPONSE:
      return {
        ...state,
        allById: {
          ...state.allById,
          ...{[action.track._id]: action.path}
        }
      }
    case WAVEFORM_GET_REQUEST:
    default:
      return state;
  }
}
