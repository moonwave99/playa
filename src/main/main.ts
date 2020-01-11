import { app, BrowserWindow, ipcMain, shell, nativeImage } from 'electron';
import { is } from 'electron-util';
import * as path from 'path';
import * as url from 'url';

import initMenu from './menu';
import loadAlbum from './loadAlbum';
import loadTracklist from './loadTracklist';
import Database from './database';
import Finder from './Finder';

declare let APP_NAME: string;

import { HEIGHT, WIDTH, MACOS, MUSIC_ROOT_FOLDER, IPC_MESSAGES } from '../constants';

const {
  IPC_PLAYLIST_GET_ALL_REQUEST,
  IPC_PLAYLIST_GET_ALL_RESPONSE,
  IPC_PLAYLIST_SAVE_REQUEST,
  IPC_PLAYLIST_SAVE_RESPONSE,
  IPC_PLAYLIST_DELETE_REQUEST,
  IPC_PLAYLIST_DELETE_RESPONSE,
  IPC_ALBUM_SEARCH_REQUEST,
  IPC_ALBUM_SEARCH_RESPONSE,
  IPC_ALBUM_GET_LIST_REQUEST,
  IPC_ALBUM_GET_LIST_RESPONSE,
  IPC_ALBUM_CONTENT_REQUEST,
  IPC_ALBUM_CONTENT_RESPONSE,
  IPC_TRACK_GET_LIST_REQUEST,
  IPC_TRACK_GET_LIST_RESPONSE,
  IPC_UI_START_ALBUM_DRAG
} = IPC_MESSAGES;

let mainWindow: Electron.BrowserWindow;

function initDatabase(userDataPath: string): void {
  const basePath = userDataPath + path.sep + 'databases' + path.sep;
  const db = {
    album: new Database(basePath, 'album', true),
    playlist: new Database(basePath, 'playlist', true),
    track: new Database(basePath, 'track', true)
  };

  ipcMain.on(IPC_PLAYLIST_GET_ALL_REQUEST, async (event) => {
    try {
      const results = await db.playlist.findAll();
      event.reply(IPC_PLAYLIST_GET_ALL_RESPONSE, results);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipcMain.on(IPC_PLAYLIST_SAVE_REQUEST, async (event, playlist) => {
    try {
      const savedPlaylist = await db.playlist.save(playlist);
      event.reply(IPC_PLAYLIST_SAVE_RESPONSE, savedPlaylist);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipcMain.on(IPC_PLAYLIST_DELETE_REQUEST, async (event, playlist) => {
    try {
      const deletedPlaylist = await db.playlist.delete(playlist);
      event.reply(IPC_PLAYLIST_DELETE_RESPONSE, deletedPlaylist);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipcMain.on(IPC_ALBUM_SEARCH_REQUEST, async (event, query) => {
    try {
      const results = await db.album.find(query, ['artist', 'title']);
      event.reply(IPC_ALBUM_SEARCH_RESPONSE, results);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipcMain.on(IPC_ALBUM_GET_LIST_REQUEST, async (event, ids) => {
    try {
      const results = await db.album.getList(ids);
      event.reply(IPC_ALBUM_GET_LIST_RESPONSE, results);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipcMain.on(IPC_ALBUM_CONTENT_REQUEST, async (event, album) => {
    try {
      const tracks = await loadAlbum(album.path);
      const savedAlbum = await db.album.save({ ...album, tracks });
      event.reply(IPC_ALBUM_CONTENT_RESPONSE, savedAlbum);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipcMain.on(IPC_TRACK_GET_LIST_REQUEST, async (event, ids) => {
    try {
      const results = await loadTracklist(ids, db.track);
      event.reply(IPC_TRACK_GET_LIST_RESPONSE, results);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipcMain.on(IPC_UI_START_ALBUM_DRAG, (event, path) => {
    const icon = nativeImage.createFromPath(process.cwd() + '/src/renderer/static/plus.png');
    event.sender.startDrag({
      file: path,
      icon
    });
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
