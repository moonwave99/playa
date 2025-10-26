import { MenuItem } from "electron";
import { send, openModal } from "@/main/controllers/init";
import { refreshMenuEntries, type GetMenuParams } from "../menu";
import { getGroupLink } from "@/lib/links";

export function getGroupMenu({ controllers, stateManager }: GetMenuParams) {
  const {
    getGroup,
    deleteGroups,
    removeArtistsFromGroup,
    setGroupCoverArtist,
  } = controllers.group;
  const menuTemplate = [
    {
      id: "gotoGroupsPage",
      label: "Go to Groups",
      accelerator: "Cmd+5",
      isNavigationEntry: true,
      click: () => send("navigate", "/groups"),
    },
    {
      id: "gotoGroupPage",
      hideOnSinglePage: true,
      disableOnNavOpen: true,
      label: "Go to Group",
      accelerator: "Enter",
      click: () =>
        send(
          "navigate",
          getGroupLink({ id: stateManager.getSelection("group").at(0) })
        ),
    },
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
      id: "setSelectedArtistAsGroupCover",
      showOnSinglePage: true,
      label: "Set selected Artist as Group Cover",
      accelerator: "C",
      click: async () =>
        setGroupCoverArtist(
          stateManager.getSelection("group").at(0),
          stateManager.getSelection("artist").at(0)
        ),
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

    menu.submenu.getMenuItemById("setSelectedArtistAsGroupCover").enabled =
      isSinglePage && stateManager.getSelection("artist").length === 1;
  }

  return { menu, refresh };
}
