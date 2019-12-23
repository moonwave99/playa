import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import playlistReducer from './modules/playlists';

const rootReducer = combineReducers({
  playlists: playlistReducer
});

const store = createStore(rootReducer, {}, applyMiddleware(thunk));

export default store;
