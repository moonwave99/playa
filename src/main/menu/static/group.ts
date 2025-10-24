import { MenuItem } from "electron";
import { openModal } from "@/main/controllers/init";
import { refreshMenuEntries, type GetMenuParams } from "../menu";

export function getGroupMenu({ controllers, stateManager }: GetMenuParams) {
  const { getGroup, deleteGroups, removeArtistsFromGroup } = controllers.group;
  const menuTemplate = [
    {
      id: "editSelectedGroup",
      hideOnSinglePage: true,
      label: "Edit selected Group",
      accelerator: "Cmd+Shift+E",
      click: async () =>
        openModal("editGroup", {
          group: await getGroup(stateManager.getSelection("group").at(0)),
        }),
    },
    {
      id: "editCurrentGroup",
      showOnSinglePage: true,
      label: "Edit current Group",
      accelerator: "Cmd+Shift+E",
      click: async () =>
        openModal("editGroup", {
          group: await getGroup(stateManager.getSelection("group").at(0)),
        }),
    },
    {
      id: "deleteSelectedGroups",
      hideOnSinglePage: true,
      allowMultiple: true,
      label: "Delete selected Groups",
      accelerator: "Backspace",
      click: () => deleteGroups(stateManager.getSelection("group")),
    },
    {
      id: "deleteCurrentGroup",
      showOnSinglePage: true,
      label: "Delete current Group",
      accelerator: "Cmd+Backspace",
      click: () => deleteGroups(stateManager.getSelection("group")),
    },
    {
      type: "separator" as const,
    },
    {
      id: "removeArtistsFromGroup",
      showOnSinglePage: true,
      label: "Remove selected Artists from Group",
      accelerator: "Backspace",
      click: () =>
        removeArtistsFromGroup(
          stateManager.getSelection("group").at(0),
          stateManager.getSelection("artist")
        ),
    },
  ];

  const menu = new MenuItem({
    id: "group",
    label: "Group",
    submenu: menuTemplate,
  });

  function refresh() {
    const isSinglePage = stateManager.isPage("group");
    refreshMenuEntries({
      menu,
      entries: menuTemplate,
      isSinglePage,
      selectionLength: stateManager.getSelection("group").length,
      ...stateManager.getState(),
    });
    menu.submenu.getMenuItemById("removeArtistsFromGroup").enabled =
      isSinglePage && !!stateManager.getSelection("artist").length;
  }

  return { menu, refresh };
}
