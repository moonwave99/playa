import type { BrowserWindow } from "electron";
import { ipcMain } from "electron";
import { init } from "./init";
import { actions as artistActions } from "./artist";
import { actions as releaseActions } from "./release";
import { actions as groupActions } from "./group";
import { actions as collectionActions } from "./collection";
import { actions as statsActions } from "./stats";
import { actions as stateActions } from "./state";
import { actions as systemActions } from "./system";
import { actions as searchResultActions } from "./searchResult";
import { actions as importExportActions } from "./importExport";
import { actions as importFoldersActions } from "./importFolders";

vi.mock("../settings");

function getMainWindow() {
  const onSwipe = vi.fn();

  const mainWindow = {
    on: vi.fn(),
    dispatchEvent(event: Event, direction: string) {
      if (event.type === "swipe") {
        onSwipe(event, direction);
      }
    },
  } as unknown as BrowserWindow & {
    dispatchEvent: (event: Event, direction: string) => void;
  };

  return { onSwipe, mainWindow };
}

describe("init function", () => {
  it("should setup the window swipe listener", () => {
    const { mainWindow, onSwipe } = getMainWindow();
    init(mainWindow);

    expect(mainWindow.on).toHaveBeenCalledWith("swipe", expect.anything());

    ["left", "right"].forEach((direction) => {
      const event = new Event("swipe");
      mainWindow.dispatchEvent(event, direction);

      expect(onSwipe).toHaveBeenCalledWith(event, direction);
    });
  });

  it("should setup the ipc listeners", () => {
    const { mainWindow } = getMainWindow();
    const ipcHandleSpy = vi.spyOn(ipcMain, "handle");

    init(mainWindow);

    [
      ...artistActions,
      ...releaseActions,
      ...groupActions,
      ...collectionActions,
      ...statsActions,
      ...stateActions,
      ...systemActions,
      ...searchResultActions,
      ...importExportActions,
      ...importFoldersActions,
      "menu:refresh",
      "menu:release",
      "menu:artist",
      "menu:collection",
      "menu:group",
      "menu:searchResult",
    ].forEach((eventName) => {
      expect(ipcHandleSpy).toHaveBeenCalledWith(eventName, expect.anything());
    });
  });
});
