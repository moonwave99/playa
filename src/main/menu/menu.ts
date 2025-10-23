import { Menu, MenuItem, dialog } from "electron";
import type { MenuItemConstructorOptions } from "electron";
import type {
  ArtistWithReleases,
  Context,
  GroupWithArtists,
} from "@/types/types";
import type { QueryKey } from "@tanstack/react-query";

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

type GetCoverEntityEntry = {
  selection_id: number;
  context: Context;
  controllers: Controllers;
};

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

type GetDeleteEntryParams = {
  id?: string;
  title: string;
  deleteFn: () => Promise<unknown>;
  queryKeys: QueryKey;
};

export function getDeleteEntry({
  id,
  title,
  deleteFn,
  queryKeys,
}: GetDeleteEntryParams) {
  return {
    id,
    label: `Remove '${title}' from Library`,
    click: async () => {
      const cancel = dialog.showMessageBoxSync(null, {
        message: `Are you sure to delete ${title}?`,
        detail: "This action is not reversible!",
        type: "warning",
        buttons: ["OK", "Cancel"],
        defaultId: 1,
      });
      if (cancel) {
        return;
      }
      await deleteFn();
      send("mutate", queryKeys);
      send("clearSelection");
    },
  };
}

type InitMenuParams = {
  controllers: Controllers;
  stateManager: StateManager;
};

export function initMenu({ controllers, stateManager }: InitMenuParams) {
  const mainMenu = Menu.getApplicationMenu();

  const menus = {
    getArtistMenu,
    getReleaseMenu,
    getCollectionMenu,
    getGroupMenu,
    getNavigateMenu,
    getLibraryMenu,
  };

  const refreshHandlers: (() => void)[] = [];

  Object.values(menus).forEach((getMenu) => {
    const { menu, refresh } = getMenu({ controllers, stateManager });
    mainMenu.append(menu);
    refreshHandlers.push(refresh);
  });

  Menu.setApplicationMenu(mainMenu);

  return {
    refreshMenu: () => refreshHandlers.forEach((fn) => fn()),
    clickEntry: (id: string) => mainMenu.getMenuItemById(id)?.click(),
  };
}
