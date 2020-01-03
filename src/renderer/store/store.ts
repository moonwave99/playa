import { Reducer, combineReducers, createStore, applyMiddleware } from 'redux';
import { RouterState, connectRouter, routerMiddleware } from 'connected-react-router';
import thunk from 'redux-thunk';
import { History, createHashHistory } from 'history';

import uiReducer, { UIState } from './modules/ui';
import playlistReducer, { PlaylistState } from './modules/playlists';

const history = createHashHistory();
const initialState = {};

export interface ApplicationState {
  router: RouterState;
  playlists: PlaylistState;
  ui: UIState;
}

function createRootReducer (history: History): Reducer {
  return combineReducers<ApplicationState>({
    router: connectRouter(history),
    playlists: playlistReducer,
    ui: uiReducer
  });
}

const middleware = [
  thunk,
  routerMiddleware(history)
];

const store = createStore(
  createRootReducer(history),
  initialState,
  applyMiddleware(...middleware)
);

export { store, history };
