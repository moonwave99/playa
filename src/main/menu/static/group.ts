import { MenuItem } from "electron";
import { openModal, type Controllers } from "@/main/controllers/init";
import { type StateManager } from "@/main/stateManager";

type GetGroupMenuParams = {
  controllers: Controllers;
  stateManager: StateManager;
};

export function getGroupMenu({
  controllers,
  stateManager,
}: GetGroupMenuParams) {
  const menu = new MenuItem({
    id: "group",
    label: "Group",
    submenu: [
      {
        id: "editGroup",
        label: "Edit Group",
        accelerator: "Shift+E",
        click: async () =>
          openModal("editGroup", {
            group: await controllers.group.getGroup(
              stateManager.getSelection("group").at(0)
            ),
          }),
      },
    ],
  });

  function refresh() {
    const enabled = !!stateManager.getSelection("group").length;
    menu.submenu.items.forEach((item) => {
      item.enabled = enabled;
    });
  }

  return { menu, refresh };
}
