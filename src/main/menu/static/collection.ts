import { MenuItem } from "electron";
import { send, openModal } from "@/main/controllers/init";
import { refreshMenuEntries, type GetMenuParams } from "../menu";
import { getCollectionLink } from "@/lib/links";

export function getCollectionMenu({
  controllers,
  stateManager,
}: GetMenuParams) {
  const {
    getCollection,
    deleteCollections,
    removeReleasesFromCollection,
    setCollectionCoverRelease,
  } = controllers.collection;

  const menuTemplate = [
    {
      id: "gotoCollectionsPage",
      label: "Go to Collections",
      accelerator: "Cmd+4",
      isNavigationEntry: true,
      click: () => send("navigate", "/collections"),
    },
    {
      id: "gotoCollectionPage",
      hideOnSinglePage: true,
      disableOnNavOpen: true,
      label: "Go to Collection",
      accelerator: "Enter",
      click: () =>
        send(
          "navigate",
          getCollectionLink({
            id: stateManager.getSelection("collection").at(0),
          })
        ),
    },
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
      id: "setSelectedReleaseAsCollectionCover",
      showOnSinglePage: true,
      label: "Set selected Release as Collection Cover",
      accelerator: "C",
      click: async () =>
        setCollectionCoverRelease(
          stateManager.getSelection("collection").at(0),
          stateManager.getSelection("release").at(0)
        ),
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

    menu.submenu.getMenuItemById(
      "setSelectedReleaseAsCollectionCover"
    ).enabled =
      isSinglePage && stateManager.getSelection("release").length === 1;
  }

  return { menu, refresh };
}
