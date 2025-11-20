import { MenuItem } from "electron";
import { searchableEntities } from "@/types/types";
import { formatEntityType } from "@/lib/utils";
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
    {
      id: "displaySearchResults",
      label: "Display Search Results",
      submenu: [
        {
          label: "All",
          accelerator: "Ctrl+1",
          click: () => send("setSearchType", "all"),
        },
        ...searchableEntities.map((entity, index) => ({
          label: formatEntityType(entity, { capital: true, plural: true }),
          accelerator: `Ctrl+${index + 2}`,
          click: () => send("setSearchType", entity),
        })),
      ],
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
      item.enabled = !(
        isInputFocused ||
        isImporting ||
        isModalOpen ||
        stateManager.get("path").startsWith("/search")
      );
    });

    menu.submenu
      .getMenuItemById("displaySearchResults")
      .submenu.items.forEach((item) => {
        item.enabled = stateManager.get("path").startsWith("/search");
      });
  }

  return { menu, refresh };
}
