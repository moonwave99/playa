import {
  BrowserWindow,
  ipcMain as ipc,
  type IpcMainEvent,
  dialog,
  app,
} from "electron";
import path from "path";
import { homedir } from "os";
import { version as appVersion } from "../../../package.json";

import { systemController } from "./system";
import { artistController } from "./artist";
import { releaseController } from "./release";
import { collectionController } from "./collection";
import { groupController } from "./group";
import { searchResultController } from "./searchResult";
import { statsController } from "./stats";
import { dialogController } from "./dialog";
import { importFoldersController } from "./importFolders";
import { importExportController } from "./importExport";
import { stateController } from "./state";
import { settingsController } from "./settings";
import { trackController } from "./track";

import { StateManager } from "../stateManager";
import { History } from "../history";

import { initMenu } from "../menu/menu";
import { releaseMenu } from "../menu/context/release";
import { artistMenu } from "../menu/context/artist";
import { collectionMenu } from "../menu/context/collection";
import { groupMenu } from "../menu/context/group";
import { trackMenu } from "../menu/context/track";
import { searchResultMenu } from "../menu/context/searchResult";

import { Modals } from "@/renderer/Modal";
import { getE2EFolderPath, IS_E2E_TEST } from "@/test/utils";
import {
  OpenFileDialogParams,
  OpenFolderDialogParams,
  Settings,
} from "@/types/types";
import { log } from "../logger";

export type Controllers = {
  system: ReturnType<typeof systemController>;
  release: ReturnType<typeof releaseController>;
  artist: ReturnType<typeof artistController>;
  collection: ReturnType<typeof collectionController>;
  group: ReturnType<typeof groupController>;
  track: ReturnType<typeof trackController>;
  searchResult: ReturnType<typeof searchResultController>;
  stats: ReturnType<typeof statsController>;
  state: ReturnType<typeof stateController>;
  settings: ReturnType<typeof settingsController>;
  dialog: ReturnType<typeof dialogController>;
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

type InitParams = {
  mainWindow: BrowserWindow;
  settings: ReturnType<typeof settingsController>;
};

export async function init({ mainWindow, settings }: InitParams) {
  const { getSetting } = settings;

  const desktopPath = path.resolve(homedir(), "Desktop");
  const userDataPath = app.getPath("userData");

  function withPath(key: keyof Omit<Settings, "id">, folderPath: string) {
    return path.join(getSetting(key) as string, folderPath);
  }

  function openFolderDialog({
    key,
    defaultPath,
    properties = [],
  }: OpenFolderDialogParams) {
    if (IS_E2E_TEST) {
      return getE2EFolderPath({
        key,
        testId: process.env.testId,
        testTitle: process.env.testTitle,
      });
    }
    const folders = dialog.showOpenDialogSync(mainWindow, {
      defaultPath,
      properties,
    });
    return folders;
  }

  function openFileDialog({ defaultPath, filters = [] }: OpenFileDialogParams) {
    const folders = dialog.showOpenDialogSync(mainWindow, {
      properties: ["openFile"],
      filters,
      defaultPath,
    });
    return folders?.at(0);
  }

  function openConfirmDialog(message: string, detail: string) {
    if (IS_E2E_TEST) {
      return true;
    }

    const clickedButton = dialog.showMessageBoxSync(null, {
      message,
      detail,
      type: "warning",
      buttons: ["OK", "Cancel"],
      defaultId: 1,
    });

    return clickedButton === 0;
  }

  function showErrorBox(title: string, content: string) {
    if (IS_E2E_TEST) {
      return;
    }
    dialog.showErrorBox(title, content);
  }

  const stateManager = new StateManager();
  const history = new History();

  history.onChange((historyState) => {
    log("history:change", historyState);
    send("historyChange", historyState);
    stateManager.setPath(historyState.currentEntry.href);
  });

  const controllers = {
    system: systemController({ withPath, getSetting, showErrorBox }),
    artist: artistController({
      send,
      showErrorBox,
      openConfirmDialog,
      stateManager,
    }),
    release: releaseController({
      withPath,
      getSetting,
      send,
      stateManager,
      showErrorBox,
      openConfirmDialog,
    }),
    collection: collectionController({ send, openConfirmDialog, stateManager }),
    group: groupController({ send, openConfirmDialog, stateManager }),
    track: trackController(),
    searchResult: searchResultController(),
    dialog: dialogController({
      openConfirmDialog,
      openFolderDialog,
      openFileDialog,
    }),
    stats: statsController(),
    state: stateController({ send, stateManager, history }),
    settings,
    importFolders: importFoldersController({
      openFolderDialog,
      getSetting,
      send,
      openModal,
      stateManager,
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
    history,
    openConfirmDialog,
  });

  stateManager.onStateChange(refreshMenu);

  [
    ...Object.values(controllers),
    {
      "menu:release": releaseMenu({ controllers, send, openModal }),
      "menu:artist": artistMenu({ controllers, send, openModal }),
      "menu:collection": collectionMenu({ controllers, send, openModal }),
      "menu:group": groupMenu({ controllers, send, openModal }),
      "menu:track": trackMenu({ controllers, send, openModal }),
      "menu:searchResult": searchResultMenu({ controllers, send, openModal }),
      "menu:click": clickEntry,
    },
  ].forEach(registerHandlers);

  mainWindow.on("swipe", (_, direction) => {
    if (stateManager.isInputFocused()) {
      return;
    }
    if (direction === "left" && history.canGoBack()) {
      history.goBack();
    }
    if (direction === "right" && history.canGoForward()) {
      history.goForward();
    }
  });

  mainWindow.webContents.on("did-finish-load", () => {
    stateManager.reset();
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
