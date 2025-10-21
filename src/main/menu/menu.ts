import { Menu, MenuItem, dialog } from "electron";
import type { MenuItemConstructorOptions } from "electron";
import type {
  ArtistWithReleases,
  ArtistWithReleasesFull,
  Context,
  Entities,
  GroupWithArtists,
} from "@/types/types";
import type { QueryKey } from "@tanstack/react-query";
import { getArtistLink, getRandomLink } from "@/lib/links";
import { getStats } from "../db/stats";
import {
  searchReleaseOnDiscogs,
  searchReleaseOnRYM,
  searchArtistOnDiscogs,
  searchArtistOnRYM,
} from "@/lib/external_links";

import type { Controllers } from "../controllers/init";

import { navigateMenu } from "./navigate";
import { releaseMenu } from "./release";
import { artistMenu } from "./artist";
import { collectionMenu } from "./collection";
import { groupMenu } from "./group";
import { searchResultMenu } from "./searchResult";
import type { StateManager } from "../stateManager";
import { send, openModal } from "../controllers/init";

export { releaseMenu, artistMenu, collectionMenu, groupMenu, searchResultMenu };

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

function refreshMenu(menu: Menu, stateManager: StateManager) {
  const { isInputFocused, selectedReleases, isImporting } =
    stateManager.getState();

  ["navigate", "library"].forEach((id) => {
    menu
      .getMenuItemById(id)
      .submenu.items.forEach((x) => (x.enabled = !isInputFocused));
  });

  ["collection" as const, "group" as const].forEach((entity) => {
    const enabled = stateManager.isPage(entity);
    menu.getMenuItemById(entity).submenu.items.forEach((item) => {
      item.enabled = enabled;
    });
  });

  menu.getMenuItemById("artist").submenu.items.forEach((item) => {
    const enabled = stateManager.isPage("artist");
    if (isInputFocused) {
      item.enabled = false;
      return;
    }
    if (item.id === "refresh-releases") {
      item.enabled = enabled && !isImporting;
      return;
    }
    item.enabled = enabled;
  });

  menu.getMenuItemById("release").submenu.items.forEach((item) => {
    if (isInputFocused) {
      item.enabled = false;
      return;
    }
    item.enabled = selectedReleases.length === 1;
    if (["addReleasesToCollection", "deleteReleases"].includes(item.id)) {
      item.enabled = selectedReleases.length > 0;
    }
  });

  const groupReleasesEntry = menu.getMenuItemById("groupReleases");
  const unGroupReleasesEntry = menu.getMenuItemById("unGroupRelease");

  const isSomeReleaseMain = selectedReleases.some((x) => x?.subReleases.length);

  if (isSomeReleaseMain) {
    if (selectedReleases.length > 1) {
      groupReleasesEntry.visible = true;
      groupReleasesEntry.enabled = false;
      unGroupReleasesEntry.visible = false;
      unGroupReleasesEntry.enabled = false;
    } else if (selectedReleases.length === 1) {
      groupReleasesEntry.visible = false;
      groupReleasesEntry.enabled = false;
      unGroupReleasesEntry.visible = true;
      unGroupReleasesEntry.enabled = true;
    }
    return;
  }
  unGroupReleasesEntry.visible = false;
  unGroupReleasesEntry.enabled = false;
  groupReleasesEntry.visible = true;
  groupReleasesEntry.enabled = selectedReleases.length > 1;
}

type MenuEntry = {
  label: string;
  accelerator: string;
};

const randomMenu: (MenuEntry & { entity: Entities })[] = [
  {
    label: "Show Random Release",
    accelerator: "Alt+R",
    entity: "release",
  },
  {
    label: "Show Random Artist",
    accelerator: "Alt+A",
    entity: "artist",
  },
  {
    label: "Show Random Collection",
    accelerator: "Alt+C",
    entity: "collection",
  },
];

type InitMenuParams = {
  controllers: Controllers;
  stateManager: StateManager;
  send: (channel: string, ...args: unknown[]) => void;
};

export function initMenu({ controllers, stateManager, send }: InitMenuParams) {
  const menu = Menu.getApplicationMenu();

  menu.append(
    new MenuItem({
      id: "artist",
      label: "Artist",
      submenu: [
        {
          label: "Reveal Artist in Finder",
          accelerator: "Cmd+Shift+F",
          click: async () =>
            controllers.system.revealEntityInFinder(
              "Artist",
              (
                (await stateManager.getCurrentEntity()) as ArtistWithReleasesFull
              ).id
            ),
        },
        {
          label: "Refresh all Releases content",
          accelerator: "Cmd+Shift+A",
          id: "refresh-releases",
          click: async () =>
            controllers.importFolders.refreshArtistReleases(
              (await stateManager.getCurrentEntity()) as ArtistWithReleasesFull
            ),
        },
        {
          label: "Import missing covers",
          accelerator: "Cmd+Shift+C",
          click: async () =>
            controllers.release.importMissingCovers(
              (
                (await stateManager.getCurrentEntity()) as ArtistWithReleasesFull
              ).releases
            ),
        },
        {
          id: "editArtist",
          label: "Edit Artist",
          accelerator: "Shift+E",
          click: async () =>
            openModal("editArtist", {
              artist: await stateManager.getCurrentEntity(),
            }),
        },
        { type: "separator" },
        {
          label: "Search Artist on Discogs",
          accelerator: "Cmd+Shift+D",
          click: async () =>
            searchArtistOnDiscogs(
              (await stateManager.getCurrentEntity()) as ArtistWithReleasesFull
            ),
        },
        {
          label: "Search Artist on RYM",
          accelerator: "Shift+R",
          click: async () =>
            searchArtistOnRYM(
              (await stateManager.getCurrentEntity()) as ArtistWithReleasesFull
            ),
        },
        { type: "separator" },
        {
          label: "Add Artist to Group",
          id: "addArtistToGroup",
          accelerator: "Shift+A",
          click: async () =>
            openModal("addArtistsToGroup", {
              artists: [await stateManager.getCurrentEntity()],
            }),
        },
      ],
    })
  );

  menu.append(
    new MenuItem({
      id: "release",
      label: "Release",
      submenu: [
        {
          label: "Go to Artist page",
          accelerator: "Shift+A",
          click: () =>
            send(
              "navigate",
              getArtistLink(stateManager.getSelectedReleases()[0].artist)
            ),
        },
        {
          label: "Open Release in Tagger",
          accelerator: "Shift+T",
          click: () =>
            controllers.system.openTagger(
              stateManager.getSelectedReleases()[0].id
            ),
        },
        {
          label: "Reveal Release in Finder",
          accelerator: "Shift+F",
          click: () =>
            controllers.system.revealEntityInFinder(
              "Release",
              stateManager.getSelectedReleases()[0].id
            ),
        },
        {
          label: "Refresh Folder Contents",
          accelerator: "Cmd+Shift+R",
          click: () =>
            controllers.importFolders.refreshReleaseContents(
              stateManager.getSelectedReleases()[0].id
            ),
        },
        {
          label: "Search Release Cover",
          accelerator: "Shift+C",
          click: () =>
            controllers.release.importCovers(
              stateManager.getSelectedReleases()
            ),
        },
        { type: "separator" },
        {
          label: "Search Release on Discogs",
          accelerator: "Shift+D",
          click: () =>
            searchReleaseOnDiscogs(stateManager.getSelectedReleases()[0]),
        },
        {
          label: "Search Release on RYM",
          accelerator: "Shift+R",
          click: () =>
            searchReleaseOnRYM(stateManager.getSelectedReleases()[0]),
        },
        {
          id: "editRelease",
          label: `Edit Release`,
          accelerator: "Cmd+Shift+E",
          click: () =>
            openModal("editRelease", {
              release: stateManager.getSelectedReleases().at(0),
            }),
        },
        {
          id: "groupReleases",
          label: `Group Selected Releases`,
          accelerator: "Cmd+G",
          click: () =>
            openModal("groupReleases", {
              releases: stateManager.getSelectedReleases(),
            }),
        },
        {
          id: "unGroupRelease",
          label: `Ungroup Selected Release`,
          accelerator: "Cmd+Shift+G",
          visible: false,
          click: controllers.release.unGroupSelectedRelease,
        },
        {
          id: "deleteReleases",
          label: "Delete Selected Release",
          accelerator: "Cmd+Backspace",
          click: () =>
            controllers.release.deleteReleases(
              stateManager.getSelectedReleases().map(({ id }) => id)
            ),
        },
        {
          id: "addReleasesToCollection",
          label: `Add Selected Releases to Collection`,
          accelerator: "a",
          click: () =>
            openModal("addReleasesToCollection", {
              releases: stateManager.getSelectedReleases(),
            }),
        },
      ],
    })
  );

  menu.append(
    new MenuItem({
      id: "collection",
      label: "Collection",
      submenu: [
        {
          id: "editCollection",
          label: "Edit Collection",
          accelerator: "Shift+E",
          click: async () =>
            openModal("editCollection", {
              collection: await stateManager.getCurrentEntity(),
            }),
        },
      ],
    })
  );

  menu.append(
    new MenuItem({
      id: "group",
      label: "Group",
      submenu: [
        {
          id: "editGroup",
          label: "Edit Group",
          accelerator: "Shift+E",
          click: async () =>
            openModal("editGroup", {
              group: await stateManager.getCurrentEntity(),
            }),
        },
      ],
    })
  );

  menu.append(
    new MenuItem({
      id: "navigate",
      label: "Navigate",
      submenu: [
        ...navigateMenu.map(({ id, label, accelerator, link }) => ({
          id,
          label,
          accelerator,
          click: () => send("navigate", link),
        })),
        {
          id: "navigate-settings",
          label: "Settings",
          accelerator: "cmd+,",
          click: () => openModal("settings"),
        },
      ],
    })
  );

  menu.append(
    new MenuItem({
      id: "library",
      label: "Library",
      submenu: [
        {
          id: "importFolder",
          label: "Import Folder",
          accelerator: "Shift+I",
          click: controllers.importFolders.importFolderFromDialog,
        },
        { type: "separator" },
        ...randomMenu.map(({ label, accelerator, entity }) => ({
          label,
          accelerator,
          click: async () =>
            send("navigate", getRandomLink(await getStats(), entity)),
        })),
        { type: "separator" },
        {
          label: "Toggle View Mode",
          accelerator: "Cmd+Shift+T",
          click: () => send("toggleViewMode"),
        },
        {
          label: "Search Library",
          accelerator: "Cmd+F",
          click: () => send("toggleSearch"),
        },
        { type: "separator" },
        {
          label: "Export Data to Archive",
          click: controllers.importExport.exportDataFromDialog,
        },
        {
          label: "Import Data from Archive",
          click: () => openModal("importData"),
        },
      ],
    })
  );

  Menu.setApplicationMenu(menu);

  return {
    refreshMenu: (stateManager: StateManager) =>
      refreshMenu(menu, stateManager),
    clickEntry: (id: string) => menu.getMenuItemById(id)?.click(),
  };
}
