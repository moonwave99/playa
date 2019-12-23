import { ipcRenderer } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import MainLayout from './layouts/MainLayout';
import store from './store/store';
import { SHOW_SEARCH } from './store/modules/ui';
import './style.scss';

ipcRenderer.on('search:show', () => {
  store.dispatch({ type: SHOW_SEARCH });
});

ReactDOM.render(
  <Provider store={store}>
    <MainLayout />
  </Provider>,
  document.getElementById('app')
);
