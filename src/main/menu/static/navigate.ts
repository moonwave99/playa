import { MenuItem } from "electron";
import { send, openModal } from "@/main/controllers/init";
import { navigateMenu } from "../navigate";
import { type GetMenuParams } from "../menu";

export function getNavigateMenu({ stateManager }: GetMenuParams) {
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
