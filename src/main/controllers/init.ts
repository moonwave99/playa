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
import { StateManager } from "../stateManager";
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
import { importFoldersController } from "./importFolders";
import { importExportController } from "./importExport";
import { stateController } from "./state";
import { Modals } from "@/renderer/Modal";
import { getE2ETmpPath, IS_E2E_TEST } from "@/test/utils";
import { settingsController } from "./settings";
import { Settings } from "@/types/types";

export type Controllers = {
  system: ReturnType<typeof systemController>;
  release: ReturnType<typeof releaseController>;
  artist: ReturnType<typeof artistController>;
  collection: ReturnType<typeof collectionController>;
  group: ReturnType<typeof groupController>;
  searchResult: ReturnType<typeof searchResultController>;
  stats: ReturnType<typeof statsController>;
  state: ReturnType<typeof stateController>;
  settings: ReturnType<typeof settingsController>;
  importFolders: ReturnType<typeof importFoldersController>;
  importExport: ReturnType<typeof importExportController>;
};

export function send(channel: string, ...args: unknown[]) {
  BrowserWindow.getAllWindows()
    .at(0)
    ?.webContents.send(channel, ...args);
}

export function openModal(name: Modals, params?: unknown) {
  send("openModal", { name, params });
}

export async function init(mainWindow: BrowserWindow) {
  const settings = settingsController();

  await settings.init();

  const { getSetting } = settings;

  const desktopPath = path.resolve(homedir(), "Desktop");
  const userDataPath = app.getPath("userData");

  function withPath(key: keyof Omit<Settings, "id">, folderPath: string) {
    return path.join(getSetting(key) as string, folderPath);
  }

  function openFolderDialog(
    defaultPath: string,
    properties: OpenDialogSyncOptions["properties"]
  ) {
    if (IS_E2E_TEST) {
      return [path.join(getE2ETmpPath(process.env.testId), "Library")];
    }
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

  function openConfirmDialog(message: string, detail: string) {
    if (IS_E2E_TEST) {
      return 0;
    }
    return dialog.showMessageBoxSync(null, {
      message,
      detail,
      type: "warning",
      buttons: ["OK", "Cancel"],
      defaultId: 1,
    });
  }

  function showErrorBox(title: string, content: string) {
    if (IS_E2E_TEST) {
      return;
    }
    dialog.showErrorBox(title, content);
  }

  const stateManager = new StateManager();

  const controllers = {
    system: systemController({ withPath, getSetting }),
    artist: artistController({
      withPath,
      send,
      showErrorBox,
      skipMove: IS_E2E_TEST,
    }),
    release: releaseController({
      withPath,
      getSetting,
      send,
      stateManager,
      showErrorBox,
      openConfirmDialog,
      skipMove: IS_E2E_TEST,
    }),
    collection: collectionController({ send, openConfirmDialog }),
    group: groupController({ send, openConfirmDialog }),
    searchResult: searchResultController(),
    stats: statsController(),
    state: stateController({ send, stateManager }),
    settings,
    importFolders: importFoldersController({
      withPath,
      getSetting,
      send,
      openModal,
      stateManager,
      openFolderDialog,
      showErrorBox,
    }),
    importExport: importExportController({
      openFileDialog,
      openFolderDialog,
      desktopPath,
      userDataPath,
      appVersion,
      send,
      openModal,
    }),
  };

  const { refreshMenu, clickEntry } = initMenu({
    controllers,
    stateManager,
    send,
  });

  stateManager.onStateChange(() => refreshMenu(stateManager));

  [
    ...Object.values(controllers),
    {
      "menu:release": releaseMenu({ controllers, send, openModal }),
      "menu:artist": artistMenu({ controllers, send, openModal }),
      "menu:collection": collectionMenu({ controllers, send, openModal }),
      "menu:group": groupMenu({ controllers, send, openModal }),
      "menu:searchResult": searchResultMenu({ controllers, send, openModal }),
      "menu:refresh": () => refreshMenu(stateManager),
      "menu:click": clickEntry,
    },
  ].forEach(registerHandlers);

  mainWindow.on("swipe", (_, direction) => {
    if (stateManager.isInputFocused()) {
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
