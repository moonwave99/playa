import { app, BrowserWindow, ipcMain as ipc, shell, dialog } from 'electron';
import { is } from 'electron-util';
import * as Path from 'path';
import * as url from 'url';

import initMenu from './menu';
import loadAlbum from './loadAlbum';
import loadTracklist from './loadTracklist';
import Database from './database';
import Finder from './Finder';
import DiscogsClient from './DiscogsClient';

import { HEIGHT, WIDTH, MACOS, MUSIC_ROOT_FOLDER, IPC_MESSAGES } from '../constants';
import { name as APP_NAME, version as APP_VERSION } from '../../package.json';
import { DISCOGS_KEY, DISCOGS_SECRET } from '../../settings/discogs.json';

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
  IPC_COVER_GET_REQUEST,
  IPC_COVER_GET_RESPONSE,
  IPC_SYS_REVEAL_IN_FINDER,
  IPC_DIALOG_SHOW_MESSAGE
} = IPC_MESSAGES;

let mainWindow: Electron.BrowserWindow;

function initDatabase(userDataPath: string): void {
  const databasePath = userDataPath + Path.sep + 'databases' + Path.sep;
  const db = {
    album: new Database(databasePath, 'album', true),
    playlist: new Database(databasePath, 'playlist', true),
    track: new Database(databasePath, 'track', true)
  };

  ipc.on(IPC_PLAYLIST_GET_ALL_REQUEST, async (event) => {
    try {
      const results = await db.playlist.findAll();
      event.reply(IPC_PLAYLIST_GET_ALL_RESPONSE, results);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipc.on(IPC_PLAYLIST_SAVE_REQUEST, async (event, playlist) => {
    try {
      const savedPlaylist = await db.playlist.save({
        ...playlist,
        accessed: new Date().toISOString()
      });
      event.reply(IPC_PLAYLIST_SAVE_RESPONSE, savedPlaylist);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipc.on(IPC_PLAYLIST_DELETE_REQUEST, async (event, playlist) => {
    try {
      const deletedPlaylist = await db.playlist.delete(playlist);
      event.reply(IPC_PLAYLIST_DELETE_RESPONSE, deletedPlaylist);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipc.on(IPC_ALBUM_SEARCH_REQUEST, async (event, query) => {
    try {
      const results = await db.album.find(query, ['artist', 'title']);
      event.reply(IPC_ALBUM_SEARCH_RESPONSE, results);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipc.on(IPC_ALBUM_GET_LIST_REQUEST, async (event, ids) => {
    try {
      const results = await db.album.getList(ids);
      event.reply(IPC_ALBUM_GET_LIST_RESPONSE, results);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipc.on(IPC_ALBUM_CONTENT_REQUEST, async (event, album) => {
    try {
      const tracks = await loadAlbum(album.path);
      const savedAlbum = await db.album.save({ ...album, tracks });
      event.reply(IPC_ALBUM_CONTENT_RESPONSE, savedAlbum);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipc.on(IPC_TRACK_GET_LIST_REQUEST, async (event, ids) => {
    try {
      const results = await loadTracklist(ids, db.track);
      event.reply(IPC_TRACK_GET_LIST_RESPONSE, results);
    } catch (error) {
      event.reply('error', error);
    }
  });


}

function initDiscogsClient(userDataPath: string): void {
  const coversPath = Path.join(userDataPath, 'new_covers');
  const discogsClient = new DiscogsClient(
    coversPath,
    `${APP_NAME}/${APP_VERSION}`,
    { consumerKey: DISCOGS_KEY, consumerSecret: DISCOGS_SECRET },
    process.env.DISABLE_DISCOGS_REQUESTS === 'true'
  );

  ipc.on(IPC_COVER_GET_REQUEST, async (event, album) => {
    try {
      const { artist, title, _id } = album;
      const imagePath = await discogsClient.getAlbumCover(artist, title, _id);
      event.reply(IPC_COVER_GET_RESPONSE, imagePath, album);
    } catch (error) {
      event.reply('error', error);
    }
  });
}

function initFinder(): void {
  const finder = new Finder(MUSIC_ROOT_FOLDER);
  ipc.on(IPC_SYS_REVEAL_IN_FINDER, (_event, album) => {
    finder.reveal(album);
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  let userDataPath = app.getPath('userData');
  if (is.development) {
    userDataPath = userDataPath.replace('Electron', APP_NAME);
  }
  initDatabase(userDataPath);
  initDiscogsClient(userDataPath);
  initFinder();

  ipc.handle(IPC_DIALOG_SHOW_MESSAGE, async (_event, options) => {
    return dialog.showMessageBox(options);
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
