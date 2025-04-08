import { BrowserWindow, ipcMain as ipc } from 'electron';
import type { IpcMainEvent } from 'electron';
import path from 'path';
import { initSettings, getSetting, getSettings, setSettings } from "./settings";
import { getStateManager } from './state';
import { initMenu, releaseMenu, artistMenu, collectionMenu, searchResultMenu } from './menu/menu';
import { systemController } from "./controllers/system";
import { artistController } from "./controllers/artist";
import { releaseController } from "./controllers/release";
import { collectionController } from "./controllers/collection";
import { searchController } from "./controllers/search";

export type Controllers = {
  system: ReturnType<typeof systemController>;
  release: ReturnType<typeof releaseController>;
  artist: ReturnType<typeof artistController>;
  collection: ReturnType<typeof collectionController>;
  search: ReturnType<typeof searchController>;
};

export function send(channel: string, ...args: unknown[]) {
  BrowserWindow.getAllWindows()[0].webContents.send(channel, ...args);
}

export function init(mainWindow: BrowserWindow) {
  initSettings();

  function withPath(key: string, folderPath: string) {
    return path.join(getSetting(key) as string, folderPath);
  }

  const state = getStateManager();
  const system = systemController({ withPath, getSetting });
  const artist = artistController({ withPath, state });
  const release = releaseController({ withPath, getSetting, send, state, mainWindow });
  const collection = collectionController();
  const search = searchController();

  state.onStateChange((state) => refreshMenu(state));

  const controllers = {
    system,
    artist,
    release,
    collection,
    search
  };

  const { refreshMenu } = initMenu({
    controllers,
    state,
    send,
  });

  const menu = {
    'menu:release': releaseMenu(controllers),
    'menu:artist': artistMenu(controllers),
    'menu:collection': collectionMenu(controllers),
    'menu:searchResult': searchResultMenu(controllers),
  };

  const settings = { getSettings, setSettings };

  [system, search, artist, release, collection, menu, settings].forEach(registerHandlers);

  mainWindow.webContents.on('did-finish-load', () => refreshMenu(state.getState()));
  mainWindow.on('swipe', (_, direction) => {
    if (state.isInputFocused()) {
      return;
    }
    if (direction === 'left' && mainWindow.webContents.navigationHistory.canGoBack()) {
      mainWindow.webContents.send('swipe', -1);
    }
    if (direction === 'right' && mainWindow.webContents.navigationHistory.canGoForward()) {
      mainWindow.webContents.send('swipe', 1);
    }
  });
}

function registerHandlers(entity: Record<string, (...args: unknown[]) => unknown>) {
  Object.entries(entity).forEach((([name, handler]) => {
    ipc.handle(name, (event: IpcMainEvent, ...params: Parameters<typeof handler>) => handler(...params, event))
  }));
}