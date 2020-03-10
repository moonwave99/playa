import * as Path from 'path';
import { ipcMain as ipc } from 'electron';
import AppState from '../lib/appState';
import { Environment } from '../main';

import { IPC_MESSAGES } from '../../constants';

const {
  IPC_UI_STATE_LOAD,
  IPC_UI_STATE_UPDATE,
} = IPC_MESSAGES;

type InitAppStateParams = {
  userDataPath: string;
  environment: Environment;
}

function getAppStateFileName(environment: Environment): string {
  switch (environment) {
    case Environment.prod:
    default:
      return 'appState.json';
    case Environment.dev:
      return 'appStateDev.json';
    case Environment.fresh:
      return 'appStateFresh.json';
  }
}

export default function initAppState({
  userDataPath,
  environment = Environment.prod
}: InitAppStateParams): AppState {
  const appState = new AppState(
    Path.join(userDataPath, getAppStateFileName(environment))
  );
  appState.load();

  ipc.handle(IPC_UI_STATE_LOAD, async () => appState.getState() );
  ipc.on(IPC_UI_STATE_UPDATE, (_event, params: object) => appState.setState(params) );

  return appState;
}
