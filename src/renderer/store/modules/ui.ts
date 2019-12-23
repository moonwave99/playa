export const SHOW_SEARCH = 'playa/ui/SHOW_SEARCH';

export interface UIState {
  showSearch: boolean;
}

interface ShowSearchAction {
  type: typeof SHOW_SEARCH;
}

export type UIActionTypes = ShowSearchAction;

const INITIAL_STATE: UIState = {
	showSearch: false
}

export const showSearch = (): Function =>
  (dispatch: Function): void =>
    dispatch({ type: SHOW_SEARCH });

export default function reducer(
  state: UIState = INITIAL_STATE,
  action: UIActionTypes
): UIState {
	switch (action.type) {
    case SHOW_SEARCH:
      state.showSearch = true;
      return state;
		default:
			return state;
	}
}
