import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { is } from 'electron-util';
import * as path from 'path';
import * as url from 'url';

import initMenu from './menu';
import Database from './database/Database';
import Finder from './Finder';

declare let APP_NAME: string;

import { HEIGHT, WIDTH, MACOS, MUSIC_ROOT_FOLDER } from '../constants';

let mainWindow: Electron.BrowserWindow;

function initDatabase(userDataPath: string): void {
  const basePath = userDataPath + path.sep + 'databases' + path.sep;
  const db = {
    album: new Database(basePath, 'album', true),
    playlist: new Database(basePath, 'playlist', true)
  };

  ipcMain.on('playlist:get-all:request', async (event) => {
    try {
      const results = await db.playlist.findAll();
      event.reply('playlist:get-all:response', results);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipcMain.on('playlist:save', async (event, playlist) => {
    try {
      const savedPlaylist = await db.playlist.save(playlist);
      event.reply('playlist:update', savedPlaylist);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipcMain.on('playlist:delete', async (event, playlist) => {
    try {
      const deletedPlaylist = await db.playlist.delete(playlist);
      event.reply('playlist:remove', deletedPlaylist);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipcMain.on('album:search:request', async (event, query) => {
    try {
      const results = await db.album.find(query, ['artist', 'title']);
      event.reply('album:search:response', results);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipcMain.on('album:get-list:request', async (event, ids) => {
    try {
      const results = await db.album.getList(ids);
      event.reply('album:get-list:response', results);
    } catch (error) {
      event.reply('error', error);
    }
  });
}

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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  let userDataPath = app.getPath('userData');
  if (is.development) {
    userDataPath = userDataPath.replace('Electron', APP_NAME);
  }
  initDatabase(userDataPath);

  const finder = new Finder(MUSIC_ROOT_FOLDER);
  ipcMain.on('reveal-in-finder', (_event, album) => {
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
