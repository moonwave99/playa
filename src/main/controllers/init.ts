import { BrowserWindow, ipcMain as ipc, type IpcMainEvent, dialog } from 'electron';
import path from 'path';
import { initSettings, getSetting, getSettings, setSettings } from "../settings";
import { StateManager } from '../state';
import { initMenu, releaseMenu, artistMenu, collectionMenu, groupMenu, searchResultMenu } from '../menu/menu';
import { systemController } from "./system";
import { artistController } from "./artist";
import { releaseController } from "./release";
import { collectionController } from "./collection";
import { groupController } from "./group";
import { searchResultController } from "./searchResult";
import { statsController } from "./stats";

export type Controllers = {
  system: ReturnType<typeof systemController>;
  release: ReturnType<typeof releaseController>;
  artist: ReturnType<typeof artistController>;
  collection: ReturnType<typeof collectionController>;
  group: ReturnType<typeof groupController>;
  searchResult: ReturnType<typeof searchResultController>;
  stats: ReturnType<typeof statsController>;
};

export function send(channel: string, ...args: unknown[]) {
  BrowserWindow.getAllWindows()[0].webContents.send(channel, ...args);
}

export function init(mainWindow: BrowserWindow) {
  initSettings();

  function withPath(key: string, folderPath: string) {
    return path.join(getSetting(key) as string, folderPath);
  }

  function openFolderDialog(defaultPath: string) {
    const folders = dialog.showOpenDialogSync(mainWindow, {
      properties: ['openDirectory', 'multiSelections'],
      defaultPath,
    });
    return folders;
  }

  const state = new StateManager();
  const system = systemController({ withPath, getSetting });
  const artist = artistController({ withPath, state });
  const release = releaseController({ withPath, getSetting, send, state, openFolderDialog });
  const collection = collectionController();
  const group = groupController();
  const searchResult = searchResultController();
  const stats = statsController();

  state.onStateChange((state) => refreshMenu(state));

  const controllers = {
    system,
    artist,
    release,
    collection,
    group,
    searchResult,
    stats
  };

  const { refreshMenu } = initMenu({
    controllers,
    state,
    send,
  });

  const menu = {
    'menu:release': releaseMenu({ controllers, send }),
    'menu:artist': artistMenu({ controllers, send }),
    'menu:collection': collectionMenu({ controllers, send }),
    'menu:group': groupMenu({ controllers, send }),
    'menu:searchResult': searchResultMenu({ controllers, send }),
  };

  const settings = { getSettings, setSettings };

  [system, searchResult, artist, release, collection, group, menu, settings, stats]
    .forEach(registerHandlers);

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


  ipc.on('state:setInputFocused', (_, inputFocused) => state.setInputFocused(inputFocused));
  ipc.on('state:selectReleases',
    (_, selectedReleases) => state.setSelectedReleases(selectedReleases)
  );
  ipc.on('state:navigate', async (_, path: string) => state.setPath(path));
  ipc.on('state:clearSelection', () => send('clearSelection'));
  ipc.on('state:toggleSidebar', () => send('toggleSidebar'));
  ipc.on('state:refreshMenu', () => refreshMenu(state.getState()));
  ipc.on('state:refreshCurrentArtist', () => state.refreshCurrentArtist());
}

function registerHandlers(entity: Record<string, (...args: unknown[]) => unknown>) {
  Object.entries(entity).forEach((([name, handler]) => {
    ipc.handle(name, (event: IpcMainEvent, ...params: Parameters<typeof handler>) => handler(...params, event))
  }));
}