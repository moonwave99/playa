import { ipcRenderer as ipc } from 'electron';
import { confirmDialog } from '../../lib/dialog'

import { IPC_MESSAGES } from '../../../constants';
const {
  IPC_UI_STATE_UPDATE,
  IPC_UI_LOCATION_UPDATE
} = IPC_MESSAGES;

const MAX_TITLE_LENGTH = 50;

function trimTitle(title: string): string {
  return title.length > MAX_TITLE_LENGTH
    ? `${title.substr(0, MAX_TITLE_LENGTH)}…`
    : title;
}

export type UIDropItem = {
  type: string;
  _id: string;
  selection?: string[];
};

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

export type Title = {
  main: string;
  sub?: string;
}

export type UIState = {
  started?: boolean;
  title: Title;
  editPlaylistTitle: boolean;
};

export const SHOW_DIALOG              = 'playa/ui/SHOW_DIALOG';
export const UPDATE_STATE             = 'playa/ui/UPDATE_STATE';
export const UPDATE_TITLE             = 'playa/ui/UPDATE_TITLE';
export const SET_EDIT_PLAYLIST_TITLE  = 'playa/ui/SET_EDIT_PLAYLIST_TITLE';

interface ShowDialogAction {
  type: typeof SHOW_DIALOG;
}

interface UpdateStateAction {
  type: typeof UPDATE_STATE;
  params: object;
}

interface UpdateTitleAction {
  type: typeof UPDATE_TITLE;
  title: Title;
}

interface SetEditPlaylistTitle {
  type: typeof SET_EDIT_PLAYLIST_TITLE;
  editPlaylistTitle: boolean;
}

export type UIActionTypes =
    ShowDialogAction
  | UpdateStateAction
  | UpdateTitleAction
  | SetEditPlaylistTitle;

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
    ipc.send(IPC_UI_STATE_UPDATE, params);
    dispatch({
      type: UPDATE_STATE,
      params
    });
  }

export const updateTitle = ({ main, sub }: Title): Function =>
  (dispatch: Function): void => {
    document.title = trimTitle(main);
    dispatch({
      type: UPDATE_TITLE,
      title: { main, sub }
    });
  }

export const setEditPlaylistTitle = (editPlaylistTitle: boolean): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: SET_EDIT_PLAYLIST_TITLE,
      editPlaylistTitle
    });
  }

export const updateLocation =
  (location: string): void => ipc.send(IPC_UI_LOCATION_UPDATE, location);

const INITIAL_STATE = {
  started: true,
  title: { main: 'Playa' },
  editPlaylistTitle: false
};

export default function reducer(
  state: UIState = INITIAL_STATE,
  action: UIActionTypes
): UIState {
	switch (action.type) {
    case UPDATE_TITLE:
      return {
        ...state,
        title: action.title
      };
    case SET_EDIT_PLAYLIST_TITLE:
      return {
        ...state,
        editPlaylistTitle: action.editPlaylistTitle
      };
    case SHOW_DIALOG:
    case UPDATE_STATE:
		default:
			return state;
	}
}
