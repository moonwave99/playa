import type { BrowserWindow } from "electron";
import { ipcMain } from "electron";
import { init } from "./init";
import { actions as artistActions } from "./artist";
import { actions as releaseActions } from "./release";
import { actions as groupActions } from "./group";
import { actions as collectionActions } from "./collection";
import { actions as systemActions } from "./system";
import { actions as searchResultActions } from "./searchResult";
import { actions as importExportActions } from "./importExport";

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
    const ipcOnSpy = vi.spyOn(ipcMain, "on");
    const ipcHandleSpy = vi.spyOn(ipcMain, "handle");

    init(mainWindow);

    [
      "state:setInputFocused",
      "state:selectReleases",
      "state:navigate",
      "state:clearSelection",
      "state:toggleSearch",
      "state:refreshMenu",
      "state:refreshCurrentArtist",
    ].forEach((eventName) => {
      expect(ipcOnSpy).toHaveBeenCalledWith(eventName, expect.anything());
    });

    [
      ...artistActions,
      ...releaseActions,
      ...groupActions,
      ...collectionActions,
      ...systemActions,
      ...searchResultActions,
      ...importExportActions,
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
