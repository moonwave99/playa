import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { is } from 'electron-util';
import * as path from 'path';
import * as url from 'url';

import Database from './database';
import Finder from './Finder';

declare let APP_NAME: string;

import { HEIGHT, WIDTH, MACOS, MUSIC_ROOT_FOLDER } from '../constants';

let mainWindow: Electron.BrowserWindow;

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    height: HEIGHT,
    width: WIDTH,
    maximizable: false,
    focusable: true,
    webPreferences: {
      allowRunningInsecureContent: false,
      nodeIntegration: true,
      nativeWindowOpen: true
    }
  });

  // And load the index.html of the app
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  // Open external URLs in default OS browser
  mainWindow.webContents.on('new-window', function (event: Electron.Event, url: string) {
    event.preventDefault();
    shell.openExternal(url);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  let userDataPath = app.getPath('userData');
  if (is.development) {
    userDataPath = userDataPath.replace('Electron', APP_NAME);
  }
  const db = new Database(userDataPath + path.sep, 'playa-database');
  const finder = new Finder(MUSIC_ROOT_FOLDER);

  ipcMain.handle('db-search', async (event, query) => {
    const results = await db.find(query);
    return results;
  });

  ipcMain.on('reveal-in-finder', (event, album) => {
    finder.reveal(album);
  });

  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (MACOS && mainWindow === null) {
    createWindow();
  }
});
