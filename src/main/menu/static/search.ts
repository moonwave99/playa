import { MenuItem } from "electron";
import { send, openModal } from "@/main/controllers/init";
import { type GetMenuParams } from "../menu";

export function getSearchMenu({ stateManager }: GetMenuParams) {
  const menuTemplate = [
    {
      id: "openQuickSearch",
      label: "Quick Search",
      accelerator: "Cmd+K",
      click: () => openModal("quickSearch"),
    },
    {
      id: "goToSearchPage",
      label: "Search Library",
      accelerator: "Cmd+F",
      click: () => send("navigate", "search"),
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

    menu.submenu.items.forEach((item) => {
      item.enabled = !(isInputFocused || isImporting || isModalOpen);
    });
  }

  return { menu, refresh };
}
