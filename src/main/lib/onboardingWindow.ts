import { BrowserWindow, ipcMain as ipc } from 'electron';
import * as Path from 'path';
import * as url from 'url';

import AppState from './appState';

import {
  ONBOARDING_WINDOW_WIDTH,
  ONBOARDING_WINDOW_HEIGHT,
  IPC_MESSAGES
} from '../../constants';

const {
  IPC_ONBOARDING_CLOSE_WINDOW
} = IPC_MESSAGES;

let onboardingWindow: BrowserWindow;

ipc.on(IPC_ONBOARDING_CLOSE_WINDOW, (): void => {
  onboardingWindow && onboardingWindow.close();
});

export default function openOnboardingWindow(appState: AppState): BrowserWindow {
  if (onboardingWindow) {
    onboardingWindow.focus();
    return onboardingWindow;
  }

  onboardingWindow = new BrowserWindow({
    width: ONBOARDING_WINDOW_WIDTH,
    height: ONBOARDING_WINDOW_HEIGHT,
    center: true,
    resizable: false,
    maximizable: false,
    focusable: true,
    show: false,
    useContentSize: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      allowRunningInsecureContent: false,
      nodeIntegration: true,
      nativeWindowOpen: true
    }
  });

  onboardingWindow.once('ready-to-show', () => {
    onboardingWindow.show();
  });

  onboardingWindow.once('closed', () => {
    onboardingWindow = null;
  });

  onboardingWindow.setMenu(null);

  onboardingWindow.loadURL(
    url.format({
      pathname: Path.join(__dirname, './onboarding.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  onboardingWindow.on('close', () => {
    appState.setState({ showOnboarding: false });
  });

  return onboardingWindow;
}
