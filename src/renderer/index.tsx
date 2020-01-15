import { ipcRenderer as ipc } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import App from './components/App/App';
import { store, history } from './store/store';
import initFontAwesome from './lib/initFontAwesome';

import { IPC_MESSAGES } from '../constants';
const { IPC_UI_STATE_LOAD } = IPC_MESSAGES;

initFontAwesome();

(async (): Promise<void> => {
  const { lastOpenedPlaylistId } = await ipc.invoke(IPC_UI_STATE_LOAD);
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <DndProvider backend={Backend}>
          <App lastOpenedPlaylistId={lastOpenedPlaylistId}/>
        </DndProvider>
      </ConnectedRouter>
    </Provider>,
    document.getElementById('app')
  );
}) ();
