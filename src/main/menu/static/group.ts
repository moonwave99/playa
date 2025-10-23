import { MenuItem } from "electron";
import { openModal } from "@/main/controllers/init";
import { type GetMenuParams } from "../menu";

export function getGroupMenu({ controllers, stateManager }: GetMenuParams) {
  const { getGroup, deleteGroups, removeArtistsFromGroup } = controllers.group;
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
            group: await getGroup(stateManager.getSelection("group").at(0)),
          }),
      },
      {
        id: "deleteGroups",
        label: "Delete Group(s)",
        accelerator: "Cmd+Backspace",
        click: () => deleteGroups(stateManager.getSelection("group")),
      },
      {
        type: "separator",
      },
      {
        id: "removeArtistsFromGroup",
        label: "Remove selected Artists from Group",
        accelerator: "Backspace",
        click: () =>
          removeArtistsFromGroup(
            stateManager.getSelection("group").at(0),
            stateManager.getSelection("artist")
          ),
      },
    ],
  });

  function refresh() {
    const isSingleGroupPage = stateManager.isPage("group");
    const enabled = !!stateManager.getSelection("group").length;
    menu.submenu.items.forEach((item) => {
      item.enabled = enabled;
      if (item.id === "removeArtistsFromGroup") {
        item.enabled =
          isSingleGroupPage && !!stateManager.getSelection("artist").length;
      }
    });
  }

  return { menu, refresh };
}
