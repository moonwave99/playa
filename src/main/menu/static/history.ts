import { MenuItem } from "electron";
import { type GetMenuParams } from "../menu";

export function getHistoryMenu({ stateManager, history }: GetMenuParams) {
  const menuTemplate = [
    {
      id: "goBack",
      label: "Go back",
      accelerator: "Cmd+Left",
      click: () => history.goBack(),
    },
    {
      id: "goForward",
      label: "Go forward",
      accelerator: "Cmd+Right",
      click: () => history.goForward(),
    },
  ];

  const menu = new MenuItem({
    id: "history",
    label: "History",
    submenu: menuTemplate,
  });

  function refresh() {
    const { isInputFocused, isImporting, isModalOpen } =
      stateManager.getState();

    if (isInputFocused || isImporting || isModalOpen) {
      menu.submenu.items.forEach((x) => (x.enabled = false));
      return;
    }
    const goBackEntry = menu.submenu.getMenuItemById("goBack");
    const goForwardEntry = menu.submenu.getMenuItemById("goForward");

    goBackEntry.enabled = history.canGoBack();
    goForwardEntry.enabled = history.canGoForward();
  }

  return { menu, refresh };
}
