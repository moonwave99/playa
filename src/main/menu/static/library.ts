import { MenuItem } from "electron";
import { send, openModal, type Controllers } from "@/main/controllers/init";
import { type StateManager } from "@/main/stateManager";
import { Entities } from "@/types/types";
import { getRandomLink } from "@/lib/links";

const randomMenu: (Pick<MenuItem, "label" | "accelerator"> & {
  entity: Entities;
})[] = [
  {
    label: "Show Random Release",
    accelerator: "Alt+R",
    entity: "release",
  },
  {
    label: "Show Random Artist",
    accelerator: "Alt+A",
    entity: "artist",
  },
  {
    label: "Show Random Collection",
    accelerator: "Alt+C",
    entity: "collection",
  },
  {
    label: "Show Random Group",
    accelerator: "Alt+G",
    entity: "group",
  },
];

type GetLibraryMenuParams = {
  controllers: Controllers;
  stateManager: StateManager;
};

export function getLibraryMenu({
  controllers,
  stateManager,
}: GetLibraryMenuParams) {
  const menu = new MenuItem({
    id: "library",
    label: "Library",
    submenu: [
      {
        id: "importFolder",
        label: "Import Folder",
        accelerator: "Shift+I",
        click: controllers.importFolders.importFolderFromDialog,
      },
      { type: "separator" },
      ...randomMenu.map(({ label, accelerator, entity }) => ({
        label,
        accelerator,
        click: async () =>
          send(
            "navigate",
            getRandomLink(await controllers.stats.getStats(), entity)
          ),
      })),
      { type: "separator" },
      {
        label: "Toggle View Mode",
        accelerator: "Cmd+Shift+T",
        click: () => send("toggleViewMode"),
      },
      {
        label: "Search Library",
        accelerator: "Cmd+F",
        click: () => send("toggleSearch"),
      },
      { type: "separator" },
      {
        label: "Export Data to Archive",
        click: controllers.importExport.exportDataFromDialog,
      },
      {
        label: "Import Data from Archive",
        click: () => openModal("importData"),
      },
    ],
  });

  function refresh() {
    const { isInputFocused } = stateManager.getState();
    menu.submenu.items.forEach((x) => (x.enabled = !isInputFocused));
  }

  return { menu, refresh };
}
