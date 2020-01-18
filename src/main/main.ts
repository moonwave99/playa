import { app, BrowserWindow, shell } from 'electron';
import { is } from 'electron-util';
import * as Path from 'path';
import * as url from 'url';

import initMenu from './initializers/initMenu';
import initDatabase from './initializers/initDatabase';
import initDiscogsClient from './initializers/initDiscogsClient';
import initURLHandler from './initializers/initURLHandler';
import initAppState from './initializers/initAppState';
import initDialog from './initializers/initDialog';

import { name as APP_NAME, version as APP_VERSION } from '../../package.json';
import { DISCOGS_KEY, DISCOGS_SECRET } from '../../settings/discogs.json';

import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  MIN_WIDTH,
  MIN_HEIGHT,
  IS_MACOS
} from '../constants';

let mainWindow: Electron.BrowserWindow;

function createWindow({
  size = [DEFAULT_WIDTH, DEFAULT_HEIGHT],
  position = [0,0]
}): void {
  mainWindow = new BrowserWindow({
    width: size[0],
    height: size[1],
    x: position[0],
    y: position[1],
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    maximizable: false,
    focusable: true,
    webPreferences: {
      allowRunningInsecureContent: false,
      nodeIntegration: true,
      nativeWindowOpen: true
    }
  });

  mainWindow.loadURL(
    url.format({
      pathname: Path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  // Open external URLs in default OS browser
  mainWindow.webContents.on('new-window', (event: Electron.Event, url: string) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  initMenu(mainWindow);

  if (is.development) {
    mainWindow.maximize();
    mainWindow.webContents.toggleDevTools();
  }
}

let userDataPath = app.getPath('userData');
let disableRequests = false;
if (is.development) {
  userDataPath = userDataPath.replace('Electron', APP_NAME);
  disableRequests = process.env.DISABLE_DISCOGS_REQUESTS === 'true';
}
initDialog();
initDatabase(userDataPath);
initURLHandler();
initDiscogsClient({
  userDataPath,
  appName: APP_NAME,
  appVersion: APP_VERSION,
  discogsKey: DISCOGS_KEY,
  discogsSecret: DISCOGS_SECRET,
  disableRequests
});

const appState = initAppState(userDataPath);
const { lastWindowSize, lastWindowPosition } = appState.getState();

app.on('ready', async () => {
  createWindow({
    size: lastWindowSize,
    position: lastWindowPosition
  });
});

app.on('activate', () => {
  if (IS_MACOS && mainWindow === null) {
    createWindow({
      size: lastWindowSize,
      position: lastWindowPosition
    });
  }
});

app.on('will-quit', () => {
  appState.setState({
    lastWindowSize: mainWindow.getSize(),
    lastWindowPosition: mainWindow.getPosition()
  });
  appState.save();
});

app.on('window-all-closed', () => {
  app.quit();
});
