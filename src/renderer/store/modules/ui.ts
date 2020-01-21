import { ipcRenderer as ipc } from 'electron';

import { IPC_MESSAGES } from '../../../constants';
const {
  IPC_UI_STATE_UPDATE
} = IPC_MESSAGES;

export const UIDragTypes = {
  SEARCH_RESULTS: 'SEARCH_RESULTS',
  COMPACT_ALBUMS: 'COMPACT_ALBUMS'
};

export enum UIAlbumView {
  Compact,
  Extended
}

export type UIState = {
  started?: boolean;
};

export const STATE_UPDATE = 'playa/ui/STATE_UPDATE';
export const TITLE_UPDATE = 'playa/ui/TITLE_UPDATE';

interface UpdateStateAction {
  type: typeof STATE_UPDATE;
  params: object;
}

interface UpdateTitleAction {
  type: typeof TITLE_UPDATE;
  title: string;
}

export type UIActionTypes =
    UpdateStateAction
  | UpdateTitleAction;

export const updateState = (params: object): Function =>
  (dispatch: Function): void => {
    ipc.send(IPC_UI_STATE_UPDATE, params);
    dispatch({
      type: STATE_UPDATE,
      params
    });
  }

export const updateTitle = (title: string): Function =>
  (dispatch: Function): void => {
    document.title = title;
    dispatch({
      type: TITLE_UPDATE,
      title
    });
  }

const INITIAL_STATE = {
  started: true
};

export default function reducer(
  state: UIState = INITIAL_STATE,
  action: UIActionTypes
): UIState {
	switch (action.type) {
    case STATE_UPDATE:
    case TITLE_UPDATE:
		default:
			return state;
	}
}
