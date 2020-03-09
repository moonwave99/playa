import * as Path from 'path';
import { ipcMain as ipc } from 'electron';
import AppState from '../lib/appState';

import { IPC_MESSAGES } from '../../constants';

const {
  IPC_UI_STATE_LOAD,
  IPC_UI_STATE_UPDATE,
} = IPC_MESSAGES;

type InitAppStateParams = {
  userDataPath: string;
  fresh?: boolean;
}

export default function initAppState({
  userDataPath,
  fresh = false
}: InitAppStateParams): AppState {
  const appStateFileName = fresh ? 'appStateFresh.json' : 'appState.json';
  const appState = new AppState(
    Path.join(userDataPath, appStateFileName)
  );
  appState.load();

  ipc.handle(IPC_UI_STATE_LOAD, async () => appState.getState() );
  ipc.on(IPC_UI_STATE_UPDATE, (_event, params: object) => appState.setState(params) );

  return appState;
}
