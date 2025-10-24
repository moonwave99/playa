import { Menu, MenuItem } from "electron";
import type { MenuItemConstructorOptions } from "electron";
import type {
  ArtistWithReleases,
  Context,
  GroupWithArtists,
} from "@/types/types";

import type { Controllers } from "../controllers/init";

import type { StateManager } from "../stateManager";
import { send } from "../controllers/init";

import { getNavigateMenu } from "./static/navigate";
import { getLibraryMenu } from "./static/library";
import { getGroupMenu } from "./static/group";
import { getCollectionMenu } from "./static/collection";
import { getReleaseMenu } from "./static/release";
import { getArtistMenu } from "./static/artist";

export function buildMenu(params: (MenuItemConstructorOptions | MenuItem)[]) {
  const menu = Menu.buildFromTemplate(params);
  menu.popup();
  return true;
}

export type GetMenuParams = {
  controllers: Controllers;
  stateManager: StateManager;
  openConfirmDialog: (message: string, detail: string) => boolean;
};

export function initMenu({
  controllers,
  stateManager,
  openConfirmDialog,
}: GetMenuParams) {
  const mainMenu = Menu.getApplicationMenu();

  const menuGetters = {
    getArtistMenu,
    getReleaseMenu,
    getCollectionMenu,
    getGroupMenu,
    getNavigateMenu,
    getLibraryMenu,
  };

  const refreshHandlers: (() => void)[] = [];

  Object.values(menuGetters).forEach((getMenu) => {
    const { menu, refresh } = getMenu({
      controllers,
      stateManager,
      openConfirmDialog,
    });
    mainMenu.append(menu);
    refreshHandlers.push(refresh);
  });

  Menu.setApplicationMenu(mainMenu);

  return {
    refreshMenu: () => refreshHandlers.forEach((fn) => fn()),
    clickEntry: (id: string) => mainMenu.getMenuItemById(id)?.click(),
  };
}

type GetCoverEntityEntry = {
  selection_id: number;
  context: Context;
  controllers: Controllers;
};

export function getCoverEntityEntry({
  selection_id,
  context,
  controllers,
}: GetCoverEntityEntry): MenuItemConstructorOptions {
  if (!shouldDisplayCoverEntityEntry(context)) {
    return { type: "separator" };
  }
  return {
    label: `Set as ${context.entityType} Cover`,
    click: async () => {
      let action, queryKey;
      if (context.entityType === "Artist") {
        queryKey = "artists";
        action = controllers.artist.setArtistCoverRelease;
      }
      if (context.entityType === "Group") {
        queryKey = "groups";
        action = controllers.group.setGroupCoverArtist;
      } else {
        queryKey = "collections";
        action = controllers.collection.setCollectionCoverRelease;
      }
      await action(context.id, selection_id);
      send("mutate", [
        [queryKey, "latest"],
        [queryKey, context.id],
      ]);
    },
  };
}

function shouldDisplayCoverEntityEntry(context: Context) {
  if (!context || !context.entityType) {
    return false;
  }
  if (context.entityType === "Group") {
    return (context as GroupWithArtists)?.artists.length > 1;
  }
  if (context.entityType === "Artist") {
    return (context as ArtistWithReleases)?.releases.length > 1;
  }
}

type MenuTemplateEntry = MenuItemConstructorOptions & {
  allowMultiple?: boolean;
  showOnSinglePage?: boolean;
  hideOnSinglePage?: boolean;
  disableOnImport?: boolean;
};

type RefreshMenuEntriesParams = {
  menu: MenuItem;
  selectionLength: number;
  isInputFocused: boolean;
  isImporting: boolean;
  isSinglePage: boolean;
  isSomeReleaseMain?: boolean;
  entries: MenuTemplateEntry[];
};

export function refreshMenuEntries({
  menu,
  selectionLength,
  isInputFocused,
  isImporting,
  isSinglePage,
  entries,
}: RefreshMenuEntriesParams) {
  entries.forEach(
    ({
      id,
      allowMultiple,
      showOnSinglePage,
      hideOnSinglePage,
      disableOnImport,
    }) => {
      const item = menu.submenu.getMenuItemById(id);
      if (isInputFocused) {
        item.enabled = false;
        item.visible = !showOnSinglePage || !isSinglePage;
        return;
      }
      if (disableOnImport && isImporting) {
        item.enabled = false;
        return;
      }
      if (showOnSinglePage) {
        item.enabled = isSinglePage;
        item.visible = isSinglePage;
        return;
      }
      if (hideOnSinglePage) {
        item.visible = !isSinglePage;
        item.enabled =
          !isSinglePage &&
          (allowMultiple ? selectionLength > 0 : selectionLength === 1);
        return;
      }
      item.enabled = allowMultiple
        ? selectionLength > 0
        : selectionLength === 1;
    }
  );
}
