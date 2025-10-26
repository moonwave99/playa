import { MenuItem } from "electron";
import { send, openModal } from "@/main/controllers/init";
import { type Entities } from "@/types/types";
import { getRandomLink } from "@/lib/links";
import { type GetMenuParams } from "../menu";

const randomMenu: (Pick<MenuItem, "id" | "label" | "accelerator"> & {
  entity: Entities;
})[] = [
  {
    id: "showRandomRelease",
    label: "Show Random Release",
    accelerator: "Alt+R",
    entity: "release",
  },
  {
    id: "showRandomArtist",
    label: "Show Random Artist",
    accelerator: "Alt+A",
    entity: "artist",
  },
  {
    id: "showRandomCollection",
    label: "Show Random Collection",
    accelerator: "Alt+C",
    entity: "collection",
  },
  {
    id: "showRandomGroup",
    label: "Show Random Group",
    accelerator: "Alt+G",
    entity: "group",
  },
];

export function getLibraryMenu({ controllers, stateManager }: GetMenuParams) {
  const menuTemplate = [
    {
      id: "gotoHomePage",
      label: "Go to Home",
      accelerator: "Cmd+1",
      isNavigationEntry: true,
      click: () => send("navigate", "/"),
    },
    {
      id: "importFolder",
      label: "Import Folder",
      accelerator: "Shift+I",
      click: controllers.importFolders.importFolderFromDialog,
    },
    { type: "separator" as const },
    ...randomMenu.map(({ entity, ...rest }) => ({
      ...rest,
      click: async () =>
        send(
          "navigate",
          getRandomLink(await controllers.stats.getStats(), entity)
        ),
    })),
    { type: "separator" as const },
    {
      id: "toggleViewMode",
      label: "Toggle View Mode",
      accelerator: "Cmd+Shift+T",
      click: () => send("toggleViewMode"),
    },
    {
      id: "searchLibrary",
      label: "Search Library",
      accelerator: "Cmd+F",
      click: () => send("toggleSearch"),
    },
    { type: "separator" as const },
    {
      id: "exportDataToArchive",
      label: "Export Data to Archive",
      click: controllers.importExport.exportDataFromDialog,
    },
    {
      id: "importDataFromArchive",
      label: "Import Data from Archive",
      click: () => openModal("importData"),
    },
  ];

  const menu = new MenuItem({
    id: "library",
    label: "Library",
    submenu: menuTemplate,
  });

  function refresh() {
    const { isInputFocused, isImporting } = stateManager.getState();
    menu.submenu.items.forEach(
      (x) => (x.enabled = !isInputFocused && !isImporting)
    );
  }

  return { menu, refresh };
}
