import { MenuItem } from "electron";
import { openModal } from "@/main/controllers/init";
import { refreshMenuEntries, type GetMenuParams } from "../menu";

export function getCollectionMenu({
  controllers,
  stateManager,
}: GetMenuParams) {
  const { getCollection, deleteCollections, removeReleasesFromCollection } =
    controllers.collection;

  const menuTemplate = [
    {
      id: "editSelectedCollection",
      hideOnSinglePage: true,
      label: "Edit selected Collection",
      accelerator: "Shift+E",
      click: async () =>
        openModal("editCollection", {
          collection: await getCollection(
            stateManager.getSelection("collection").at(0)
          ),
        }),
    },
    {
      id: "editCurrentCollection",
      showOnSinglePage: true,
      label: "Edit current Collection",
      accelerator: "Cmd+Shift+E",
      click: async () =>
        openModal("editCollection", {
          collection: await getCollection(
            stateManager.getSelection("collection").at(0)
          ),
        }),
    },
    {
      id: "deleteSelectedCollections",
      hideOnSinglePage: true,
      allowMultiple: true,
      label: "Delete Collection",
      accelerator: "Backspace",
      click: () => deleteCollections(stateManager.getSelection("collection")),
    },
    {
      id: "deleteCurrentCollection",
      showOnSinglePage: true,
      label: "Delete Collection",
      accelerator: "Cmd+Backspace",
      click: () => deleteCollections(stateManager.getSelection("collection")),
    },
    {
      type: "separator" as const,
    },
    {
      id: "removeReleasesFromCollection",
      showOnSinglePage: true,
      label: "Remove selected Releases from Collection",
      accelerator: "Backspace",
      click: () =>
        removeReleasesFromCollection(
          stateManager.getSelection("collection").at(0),
          stateManager.getSelection("release")
        ),
    },
  ];

  const menu = new MenuItem({
    id: "collection",
    label: "Collection",
    submenu: menuTemplate,
  });

  function refresh() {
    const isSinglePage = stateManager.isPage("collection");
    refreshMenuEntries({
      menu,
      entries: menuTemplate,
      isSinglePage,
      selectionLength: stateManager.getSelection("collection").length,
      ...stateManager.getState(),
    });
    menu.submenu.getMenuItemById("removeReleasesFromCollection").enabled =
      isSinglePage && !!stateManager.getSelection("release").length;
  }

  return { menu, refresh };
}
