import { ipcRenderer as ipc } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import ReactModal from 'react-modal';
import WebFont from 'webfontloader';
import Player from './player';
import { App } from './components/App/App';
import { initStore, history } from './store/store';
import initI18n from './lib/initI18n';
import initFontAwesome from './lib/initFontAwesome';

import { FONTS, IPC_MESSAGES } from '../constants';
const {
  IPC_UI_STATE_LOAD,
  IPC_WAVEFORM_GET_BASE_PATH
} = IPC_MESSAGES;

(async (): Promise<void> => {
  WebFont.load({ custom: { families: FONTS } });
  initFontAwesome();
  initI18n();

  const player = new Player({
    audioElement: document.getElementById('player') as HTMLAudioElement
  });

  const {
    lastOpenedPlaylistId,
    queue
  } = await ipc.invoke(IPC_UI_STATE_LOAD);

  const waveformBasePath = await ipc.invoke(IPC_WAVEFORM_GET_BASE_PATH);
  const store = initStore(player);

  ReactModal.setAppElement('#app');

  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <DndProvider backend={Backend}>
          <App
            player={player}
            waveformBasePath={waveformBasePath}
            lastOpenedPlaylistId={lastOpenedPlaylistId}
            queue={queue}/>
        </DndProvider>
      </ConnectedRouter>
    </Provider>,
    document.getElementById('app')
  );
}) ();
