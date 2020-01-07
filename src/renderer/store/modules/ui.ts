import openContextMenu, { ContextMenuOptions } from '../../utils/contextMenu';

export type UIState = {
  started?: boolean;
};

export const SHOW_CONTEXT_MENU = 'playa/ui/SHOW_CONTEXT_MENU';

interface ShowContextMenuAction {
  type: typeof SHOW_CONTEXT_MENU;
  options: ContextMenuOptions;
}

export type UIActionTypes = ShowContextMenuAction;

const INITIAL_STATE = {
  started: true
};

export const showContextMenu = (options: ContextMenuOptions): Function =>
  (dispatch: Function): void =>
    dispatch({
      type: SHOW_CONTEXT_MENU,
      options
    });

export default function reducer(
  state: UIState = INITIAL_STATE,
  action: UIActionTypes
): UIState {
	switch (action.type) {
    case SHOW_CONTEXT_MENU:
      openContextMenu(action.options);
      return state;
		default:
			return state;
	}
}
