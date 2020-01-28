import { ipcRenderer as ipc } from 'electron';
import { confirmDialog } from '../../lib/dialog'

import { IPC_MESSAGES } from '../../../constants';
const {
  IPC_UI_UPDATE_STATE
} = IPC_MESSAGES;

const MAX_TITLE_LENGTH = 50;

function trimTitle(title: string): string {
  return title.length > MAX_TITLE_LENGTH
    ? `${title.substr(0, MAX_TITLE_LENGTH)}…`
    : title;
}

export const UIDragTypes = {
  SEARCH_RESULTS: 'SEARCH_RESULTS',
  PLAYLIST_ALBUMS: 'PLAYLIST_ALBUMS',
  QUEUE_ALBUMS: 'QUEUE_ALBUMS',
  COMPACT_ALBUMS: 'COMPACT_ALBUMS',
  LIBRARY_ALBUMS: 'LIBRARY_ALBUMS'
};

export enum UIAlbumView {
  Compact,
  Extended
}

export type UIState = {
  started?: boolean;
};

export const SHOW_DIALOG  = 'playa/ui/SHOW_DIALOG';
export const UPDATE_STATE = 'playa/ui/UPDATE_STATE';
export const UPDATE_TITLE = 'playa/ui/UPDATE_TITLE';

interface ShowDialogAction {
  type: typeof SHOW_DIALOG;
}

interface UpdateStateAction {
  type: typeof UPDATE_STATE;
  params: object;
}

interface UpdateTitleAction {
  type: typeof UPDATE_TITLE;
  title: string;
}

export type UIActionTypes =
    ShowDialogAction
  | UpdateStateAction
  | UpdateTitleAction;

export const showDialog = (
  title: string,
  message: string,
  buttons: string[] = ['OK']
): Function =>
  (dispatch: Function): void => {
    confirmDialog({ title, message, buttons });
    dispatch({
      type: SHOW_DIALOG
    });
  }

export const updateState = (params: object): Function =>
  (dispatch: Function): void => {
    ipc.send(IPC_UI_UPDATE_STATE, params);
    dispatch({
      type: UPDATE_STATE,
      params
    });
  }

export const updateTitle = (title: string): Function =>
  (dispatch: Function): void => {
    document.title = trimTitle(title);
    dispatch({
      type: UPDATE_TITLE,
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
    case SHOW_DIALOG:
    case UPDATE_STATE:
    case UPDATE_TITLE:
		default:
			return state;
	}
}
