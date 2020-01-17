import { ipcRenderer as ipc } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import Player from './player';
import { App } from './components/App/App';
import { initStore, history } from './store/store';
import initFontAwesome from './lib/initFontAwesome';

import { IPC_MESSAGES } from '../constants';
const { IPC_UI_STATE_LOAD } = IPC_MESSAGES;

initFontAwesome();

// 1. listen to player events
// 2. call player API from events && user interaction
// 3. call player API if state changes
// 4. use a singleton and fu - https://stackoverflow.com/questions/30174078/how-to-define-singleton-in-typescript
const player = new Player({
  audioElement: document.getElementById('player') as HTMLAudioElement
});

const store = initStore(player);

(async (): Promise<void> => {
  const { lastOpenedPlaylistId } = await ipc.invoke(IPC_UI_STATE_LOAD);
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <DndProvider backend={Backend}>
          <App
            player={player}
            lastOpenedPlaylistId={lastOpenedPlaylistId}/>
        </DndProvider>
      </ConnectedRouter>
    </Provider>,
    document.getElementById('app')
  );
}) ();
