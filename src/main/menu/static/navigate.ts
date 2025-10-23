import { MenuItem } from "electron";
import { send, openModal } from "@/main/controllers/init";
import { type StateManager } from "@/main/stateManager";
import { navigateMenu } from "../navigate";

type GetNavigateMenuParams = {
  stateManager: StateManager;
};

export function getNavigateMenu({ stateManager }: GetNavigateMenuParams) {
  const menu = new MenuItem({
    id: "navigate",
    label: "Navigate",
    submenu: [
      ...navigateMenu.map(({ id, label, accelerator, link }) => ({
        id,
        label,
        accelerator,
        click: () => send("navigate", link),
      })),
      {
        id: "navigate-settings",
        label: "Settings",
        accelerator: "cmd+,",
        click: () => openModal("settings"),
      },
    ],
  });

  function refresh() {
    const { isInputFocused } = stateManager.getState();
    menu.submenu.items.forEach((x) => (x.enabled = !isInputFocused));
  }

  return { menu, refresh };
}
