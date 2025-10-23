import { MenuItem } from "electron";
import { openModal } from "@/main/controllers/init";
import { type GetMenuParams } from "../menu";

export function getCollectionMenu({
  controllers,
  stateManager,
}: GetMenuParams) {
  const { getCollection, deleteCollections, removeReleasesFromCollection } =
    controllers.collection;

  const menu = new MenuItem({
    id: "collection",
    label: "Collection",
    submenu: [
      {
        id: "editCollection",
        label: "Edit Collection",
        accelerator: "Shift+E",
        click: async () =>
          openModal("editCollection", {
            collection: await getCollection(
              stateManager.getSelection("collection").at(0)
            ),
          }),
      },
      {
        id: "deleteCollections",
        label: "Delete Collection(s)",
        accelerator: "Cmd+Backspace",
        click: () => deleteCollections(stateManager.getSelection("collection")),
      },
      {
        type: "separator",
      },
      {
        id: "removeReleasesFromCollection",
        label: "Remove selected Releases from Collection",
        accelerator: "Backspace",
        click: () =>
          removeReleasesFromCollection(
            stateManager.getSelection("collection").at(0),
            stateManager.getSelection("release")
          ),
      },
    ],
  });

  function refresh() {
    const isSingleReleasePage = stateManager.isPage("collection");
    const enabled = !!stateManager.getSelection("collection").length;
    menu.submenu.items.forEach((item) => {
      item.enabled = enabled;
      if (item.id === "removeReleasesFromCollection") {
        item.enabled =
          isSingleReleasePage && !!stateManager.getSelection("release").length;
      }
    });
  }

  return { menu, refresh };
}
