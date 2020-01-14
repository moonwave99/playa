import { app, BrowserWindow, shell } from 'electron';
import { is } from 'electron-util';
import * as Path from 'path';
import * as url from 'url';

import initMenu from './initializers/initMenu';
import initDatabase from './initializers/initDatabase';
import initDiscogsClient from './initializers/initDiscogsClient';
import initFinder from './initializers/initFinder';
import initAppState from './initializers/initAppState';
import initDialog from './initializers/initDialog';

import { name as APP_NAME, version as APP_VERSION } from '../../package.json';
import { DISCOGS_KEY, DISCOGS_SECRET } from '../../settings/discogs.json';

import {
  HEIGHT,
  WIDTH,
  MIN_WIDTH,
  MIN_HEIGHT,
  IS_MACOS
} from '../constants';

let mainWindow: Electron.BrowserWindow;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    height: HEIGHT,
    width: WIDTH,
    minHeight: MIN_HEIGHT,
    minWidth: MIN_WIDTH,
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
      pathname: Path.join(__dirname, './static/index.html'),
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

app.on('ready', async () => {
  let userDataPath = app.getPath('userData');
  let disableRequests = false;
  if (is.development) {
    userDataPath = userDataPath.replace('Electron', APP_NAME);
    disableRequests = process.env.DISABLE_DISCOGS_REQUESTS === 'true';
  }
  initDialog();
  initAppState(userDataPath);
  initDatabase(userDataPath);
  initFinder();
  initDiscogsClient({
    userDataPath,
    appName: APP_NAME,
    appVersion: APP_VERSION,
    discogsKey: DISCOGS_KEY,
    discogsSecret: DISCOGS_SECRET,
    disableRequests
  });
  createWindow();
});

app.on('activate', () => {
  if (IS_MACOS && mainWindow === null) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
