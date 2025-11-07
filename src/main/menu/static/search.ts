import { MenuItem } from "electron";
import { send } from "@/main/controllers/init";
import { type GetMenuParams } from "../menu";

export function getSearchMenu({ stateManager }: GetMenuParams) {
  const menuTemplate = [
    {
      id: "searchLibrary",
      label: "Search Library",
      accelerator: "Cmd+F",
      click: () => send("toggleSearch"),
    },
  ];

  const menu = new MenuItem({
    id: "search",
    label: "Search",
    submenu: menuTemplate,
  });

  function refresh() {
    const { isInputFocused, isImporting, isModalOpen } =
      stateManager.getState();

    menu.submenu.items.forEach(
      (x) => (x.enabled = !(isInputFocused || isImporting || isModalOpen))
    );
  }

  return { menu, refresh };
}
