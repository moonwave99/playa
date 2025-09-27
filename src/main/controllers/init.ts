import {
  BrowserWindow,
  ipcMain as ipc,
  type IpcMainEvent,
  type OpenDialogSyncOptions,
  dialog,
  app,
} from "electron";
import path from "path";
import { homedir } from "os";
import { version as appVersion } from "../../../package.json";
import {
  initSettings,
  getSetting,
  getSettings,
  setSettings,
} from "../settings";
import { StateManager } from "../state";
import {
  initMenu,
  releaseMenu,
  artistMenu,
  collectionMenu,
  groupMenu,
  searchResultMenu,
} from "../menu/menu";
import { systemController } from "./system";
import { artistController } from "./artist";
import { releaseController } from "./release";
import { collectionController } from "./collection";
import { groupController } from "./group";
import { searchResultController } from "./searchResult";
import { statsController } from "./stats";
import { importExportController } from "./importExport";

export type Controllers = {
  system: ReturnType<typeof systemController>;
  release: ReturnType<typeof releaseController>;
  artist: ReturnType<typeof artistController>;
  collection: ReturnType<typeof collectionController>;
  group: ReturnType<typeof groupController>;
  searchResult: ReturnType<typeof searchResultController>;
  stats: ReturnType<typeof statsController>;
  importExport: ReturnType<typeof importExportController>;
};

export function send(channel: string, ...args: unknown[]) {
  BrowserWindow.getAllWindows()[0].webContents.send(channel, ...args);
}

export function init(mainWindow: BrowserWindow) {
  initSettings();

  const desktopPath = path.resolve(homedir(), "Desktop");
  const userDataPath = app.getPath("userData");

  function withPath(key: string, folderPath: string) {
    return path.join(getSetting(key) as string, folderPath);
  }

  function openFolderDialog(
    defaultPath: string,
    properties: OpenDialogSyncOptions["properties"]
  ) {
    const folders = dialog.showOpenDialogSync(mainWindow, {
      properties,
      defaultPath,
    });
    return folders;
  }

  function openFileDialog(
    defaultPath: string,
    filters: OpenDialogSyncOptions["filters"] = []
  ) {
    const folders = dialog.showOpenDialogSync(mainWindow, {
      properties: ["openFile"],
      filters,
      defaultPath,
    });
    return folders?.at(0);
  }

  const state = new StateManager();

  const controllers = {
    system: systemController({ withPath, getSetting }),
    artist: artistController({ withPath, state, send }),
    release: releaseController({
      withPath,
      getSetting,
      send,
      state,
      openFolderDialog,
    }),
    collection: collectionController({ send }),
    group: groupController({ send }),
    searchResult: searchResultController(),
    stats: statsController(),
    importExport: importExportController({
      openFileDialog,
      openFolderDialog,
      desktopPath,
      userDataPath,
      appVersion,
      send,
    }),
  };

  const { refreshMenu } = initMenu({
    controllers,
    state,
    send,
  });

  state.onStateChange(refreshMenu);

  [
    ...Object.values(controllers),
    { getSettings, setSettings },
    {
      "menu:release": releaseMenu({ controllers, send }),
      "menu:artist": artistMenu({ controllers, send }),
      "menu:collection": collectionMenu({ controllers, send }),
      "menu:group": groupMenu({ controllers, send }),
      "menu:searchResult": searchResultMenu({ controllers, send }),
    },
  ].forEach(registerHandlers);

  mainWindow.on("swipe", (_, direction) => {
    if (state.isInputFocused()) {
      return;
    }
    if (
      direction === "left" &&
      mainWindow.webContents.navigationHistory.canGoBack()
    ) {
      mainWindow.webContents.send("swipe", -1);
    }
    if (
      direction === "right" &&
      mainWindow.webContents.navigationHistory.canGoForward()
    ) {
      mainWindow.webContents.send("swipe", 1);
    }
  });

  ipc.on("state:setInputFocused", (_, inputFocused) =>
    state.setInputFocused(inputFocused)
  );
  ipc.on("state:selectReleases", (_, selectedReleases) =>
    state.setSelectedReleases(selectedReleases)
  );
  ipc.on("state:navigate", async (_, path: string) => state.setPath(path));
  ipc.on("state:clearSelection", () => send("clearSelection"));
  ipc.on("state:toggleSearch", () => send("toggleSearch"));
  ipc.on("state:refreshMenu", () => refreshMenu(state.getState()));
  ipc.on("state:refreshCurrentArtist", () => state.refreshCurrentArtist());
}

function registerHandlers(
  entity: Record<string, (...args: unknown[]) => unknown>
) {
  Object.entries(entity).forEach(([name, handler]) => {
    ipc.handle(
      name,
      (event: IpcMainEvent, ...params: Parameters<typeof handler>) =>
        handler(...params, event)
    );
  });
}
