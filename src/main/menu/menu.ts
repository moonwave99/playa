import { Menu, MenuItem, shell } from "electron";
import type { MenuItemConstructorOptions } from "electron";
import type {
  ArtistWithReleases,
  Context,
  GroupWithArtists,
} from "@/types/types";

import type { Controllers } from "../controllers/init";
import type { History } from "../history";
import type { State, StateManager } from "../stateManager";
import { openModal, send } from "../controllers/init";

import { getHistoryMenu } from "./static/history";
import { getLibraryMenu } from "./static/library";
import { getGroupMenu } from "./static/group";
import { getCollectionMenu } from "./static/collection";
import { getReleaseMenu } from "./static/release";
import { getArtistMenu } from "./static/artist";
import { capitalize } from "lodash";

import pkg from "../../../package.json";

export function buildMenu(params: (MenuItemConstructorOptions | MenuItem)[]) {
  const menu = Menu.buildFromTemplate(params);
  menu.popup();
  return true;
}

export type GetMenuParams = {
  controllers: Controllers;
  stateManager: StateManager;
  history: History;
  openConfirmDialog: (message: string, detail: string) => boolean;
};

export function initMenu({
  controllers,
  stateManager,
  history,
  openConfirmDialog,
}: GetMenuParams) {
  const { template, refreshHandlers } = [
    getHistoryMenu,
    getReleaseMenu,
    getArtistMenu,
    getCollectionMenu,
    getGroupMenu,
    getLibraryMenu,
  ].reduce(
    ({ template, refreshHandlers }, getter) => {
      const { menu, refresh } = getter({
        controllers,
        stateManager,
        history,
        openConfirmDialog,
      });
      return {
        template: [...template, menu],
        refreshHandlers: [...refreshHandlers, refresh],
      };
    },
    {
      template: [] as MenuItem[],
      refreshHandlers: [] as (() => void)[],
    }
  );

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        role: "appMenu",
        submenu: [
          { role: "about" },
          { type: "separator" },
          { role: "hide" },
          { role: "quit" },
          { type: "separator" },
          {
            id: "openSettings",
            label: "Settings",
            accelerator: "Cmd+,",
            click: () => openModal("settings"),
          },
        ],
      },
      { role: "editMenu" },
      {
        role: "viewMenu",
        submenu: [
          { role: "togglefullscreen" },
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
        ],
      },
      ...template,
      { role: "windowMenu" as const },
      {
        role: "help" as const,
        submenu: [
          {
            label: "Learn More",
            click: () => shell.openExternal(pkg.homepage),
          },
          { role: "toggleDevTools" },
          process.env.NODE_ENV === "development"
            ? { role: "reload" }
            : { type: "separator" },
        ],
      },
    ])
  );

  const mainMenu = Menu.getApplicationMenu();

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
    label: `Set as ${capitalize(context.entityType)} Cover`,
    click: async () => {
      let action, queryKey;
      if (context.entityType === "artist") {
        queryKey = "artists";
        action = controllers.artist.setArtistCoverRelease;
      }
      if (context.entityType === "group") {
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
  if (context.entityType === "group") {
    return (context as GroupWithArtists)?.artists.length > 1;
  }
  if (context.entityType === "artist") {
    return (context as ArtistWithReleases)?.releases.length > 1;
  }
}

type MenuTemplateEntry = MenuItemConstructorOptions & {
  allowMultiple?: boolean;
  showOnSinglePage?: boolean;
  hideOnSinglePage?: boolean;
  disableOnImport?: boolean;
  disableOnNavOpen?: boolean;
  isNavigationEntry?: boolean;
};

type RefreshMenuEntriesParams = Pick<
  State,
  "isInputFocused" | "isNavOpen" | "isImporting" | "isOnboarding"
> & {
  menu: MenuItem;
  selectionLength: number;
  isSinglePage: boolean;
  isSomeReleaseMain?: boolean;
  entries: MenuTemplateEntry[];
};

export function refreshMenuEntries({
  menu,
  selectionLength,
  isInputFocused,
  isImporting,
  isOnboarding,
  isNavOpen,
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
      disableOnNavOpen,
      isNavigationEntry,
    }) => {
      const item = menu.submenu.getMenuItemById(id);
      if (isOnboarding) {
        item.enabled = false;
        return;
      }

      if (isInputFocused) {
        item.enabled = false;
        item.visible = !showOnSinglePage || !isSinglePage;
        return;
      }
      if (disableOnNavOpen && isNavOpen) {
        item.enabled = false;
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
      if (isNavigationEntry) {
        item.enabled = true;
        return;
      }
      item.enabled = allowMultiple
        ? selectionLength > 0
        : selectionLength === 1;
    }
  );
}
