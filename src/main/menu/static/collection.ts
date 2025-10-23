import { MenuItem } from "electron";
import { openModal, type Controllers } from "@/main/controllers/init";
import { type StateManager } from "@/main/stateManager";

type GetCollectionMenuParams = {
  controllers: Controllers;
  stateManager: StateManager;
};

export function getCollectionMenu({
  controllers,
  stateManager,
}: GetCollectionMenuParams) {
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
            collection: await controllers.collection.getCollection(
              stateManager.getSelection("collection").at(0)
            ),
          }),
      },
    ],
  });

  function refresh() {
    const enabled = !!stateManager.getSelection("collection").length;
    menu.submenu.items.forEach((item) => {
      item.enabled = enabled;
    });
  }

  return { menu, refresh };
}
