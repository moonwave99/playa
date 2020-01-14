import { ipcRenderer as ipc } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import MainLayout from './layouts/MainLayout';
import { store, history } from './store/store';
import { initIpc } from './ipc';
import './style.scss';

import { IPC_MESSAGES } from '../constants';
const { IPC_UI_STATE_LOAD } = IPC_MESSAGES;

(async (): Promise<void> => {
  const { lastOpenedPlaylistId } = await ipc.invoke(IPC_UI_STATE_LOAD);
  initIpc();
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <DndProvider backend={Backend}>
          <MainLayout
            lastOpenedPlaylistId={lastOpenedPlaylistId}/>
        </DndProvider>
      </ConnectedRouter>
    </Provider>,
    document.getElementById('app')
  );
}) ();
