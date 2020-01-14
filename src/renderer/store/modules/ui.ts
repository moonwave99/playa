import { ipcRenderer as ipc } from 'electron';
import openContextMenu, { ContextMenuOptions } from '../../utils/contextMenu';

import { IPC_MESSAGES } from '../../../constants';
const {
  IPC_UI_START_ALBUM_DRAG,
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
export const SHOW_CONTEXT_MENU = 'playa/ui/SHOW_CONTEXT_MENU';
export const START_ALBUM_DRAG = 'playa/ui/START_ALBUM_DRAG';

interface UpdateStateAction {
  type: typeof STATE_UPDATE;
  params: object;
}

interface UpdateTitleAction {
  type: typeof TITLE_UPDATE;
  title: string;
}

interface ShowContextMenuAction {
  type: typeof SHOW_CONTEXT_MENU;
  options: ContextMenuOptions;
}

interface StartAlbumDragAction {
  type: typeof START_ALBUM_DRAG;
  path: string;
}

export type UIActionTypes =
    UpdateStateAction
  | UpdateTitleAction
  | ShowContextMenuAction
  | StartAlbumDragAction;

export const updateState = (params: object): Function =>
  (dispatch: Function): void =>
    dispatch({
      type: STATE_UPDATE,
      params
    });

export const updateTitle = (title: string): Function =>
  (dispatch: Function): void =>
    dispatch({
      type: TITLE_UPDATE,
      title
    });

export const showContextMenu = (options: ContextMenuOptions): Function =>
  (dispatch: Function): void =>
    dispatch({
      type: SHOW_CONTEXT_MENU,
      options
    });

export const startAlbumDrag = (path: string): Function =>
  (dispatch: Function): void =>
    dispatch({
      type: START_ALBUM_DRAG,
      path
    });

const INITIAL_STATE = {
  started: true
};

export default function reducer(
  state: UIState = INITIAL_STATE,
  action: UIActionTypes
): UIState {
	switch (action.type) {
    case STATE_UPDATE:
      ipc.send(IPC_UI_STATE_UPDATE, action.params);
      return state;
    case TITLE_UPDATE:
      document.title = action.title;
      return state;
    case SHOW_CONTEXT_MENU:
      openContextMenu(action.options);
      return state;
    case START_ALBUM_DRAG:
      ipc.send(IPC_UI_START_ALBUM_DRAG, action.path);
      return state;
		default:
			return state;
	}
}
