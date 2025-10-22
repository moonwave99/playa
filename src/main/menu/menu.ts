import { Menu, MenuItem, dialog } from "electron";
import type { MenuItemConstructorOptions } from "electron";
import type {
  ArtistWithReleases,
  ArtistWithReleasesFull,
  Context,
  Entities,
  GroupWithArtists,
  ReleaseWithArtist,
  ReleaseWithArtistAndTracks,
} from "@/types/types";
import type { QueryKey } from "@tanstack/react-query";
import { getRandomLink } from "@/lib/links";
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
import { getRelease, getSelectedReleases } from "../db/release";
import { getSelectedArtist, getSelectedArtists } from "../db/artist";
import { getCollection } from "../db/collection";
import { getGroup } from "../db/group";

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

async function refreshMenu(menu: Menu, stateManager: StateManager) {
  const { isInputFocused, isImporting } = stateManager.getState();

  ["navigate", "library"].forEach((id) => {
    menu
      .getMenuItemById(id)
      .submenu.items.forEach((x) => (x.enabled = !isInputFocused));
  });

  ["collection" as const, "group" as const].forEach((entity) => {
    const enabled = !!stateManager.getSelection(entity).length;
    menu.getMenuItemById(entity).submenu.items.forEach((item) => {
      item.enabled = enabled;
    });
  });

  menu.getMenuItemById("artist").submenu.items.forEach((item) => {
    if (isInputFocused) {
      item.enabled = false;
      return;
    }

    if (stateManager.getSelection("artist").length > 1) {
      item.enabled = ["addArtistsToGroup"].includes(item.id);
      return;
    }

    if (stateManager.getSelection("artist").length === 1) {
      item.enabled = item.id === "refresh-releases" ? !isImporting : true;
      return;
    }

    item.enabled = false;
  });

  const selectedReleasesIds = stateManager.getSelection("release");

  menu.getMenuItemById("release").submenu.items.forEach((item) => {
    if (isInputFocused) {
      item.enabled = false;
      return;
    }

    item.enabled = selectedReleasesIds.length === 1;
    if (["addReleasesToCollection", "deleteReleases"].includes(item.id)) {
      item.enabled = selectedReleasesIds.length > 0;
    }
  });

  const groupReleasesEntry = menu.getMenuItemById("groupReleases");
  const unGroupReleasesEntry = menu.getMenuItemById("unGroupRelease");

  const selectedReleases = await getSelectedReleases(selectedReleasesIds);

  const isSomeReleaseMain = selectedReleases.some((x) => x?.subReleases.length);

  if (isSomeReleaseMain) {
    if (selectedReleasesIds.length > 1) {
      groupReleasesEntry.visible = true;
      groupReleasesEntry.enabled = false;
      unGroupReleasesEntry.visible = false;
      unGroupReleasesEntry.enabled = false;
    } else if (selectedReleasesIds.length === 1) {
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
  groupReleasesEntry.enabled = selectedReleasesIds.length > 1;
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
  {
    label: "Show Random Group",
    accelerator: "Alt+G",
    entity: "group",
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
              stateManager.getSelection("artist").at(0)
            ),
        },
        {
          label: "Refresh all Releases content",
          accelerator: "Cmd+Shift+A",
          id: "refresh-releases",
          click: async () =>
            controllers.importFolders.refreshArtistReleases(
              (await getSelectedArtist(
                stateManager.getSelection("artist")
              )) as ArtistWithReleasesFull
            ),
        },
        {
          label: "Import missing covers",
          accelerator: "Cmd+Shift+C",
          click: async () =>
            controllers.release.importMissingCovers(
              (await getSelectedArtist(stateManager.getSelection("artist")))
                .releases
            ),
        },
        {
          id: "editArtist",
          label: "Edit Artist",
          accelerator: "Shift+E",
          click: async () =>
            openModal("editArtist", {
              artist: await getSelectedArtist(
                stateManager.getSelection("artist")
              ),
            }),
        },
        {
          id: "deleteArtist",
          label: "Delete Artist",
          click: async () =>
            controllers.artist.deleteArtist(
              stateManager.getSelection("artist").at(0)
            ),
        },
        { type: "separator" },
        {
          label: "Search Artist on Discogs",
          accelerator: "Cmd+Shift+D",
          click: async () =>
            searchArtistOnDiscogs(
              await getSelectedArtist(stateManager.getSelection("artist"))
            ),
        },
        {
          label: "Search Artist on RYM",
          accelerator: "Shift+R",
          click: async () =>
            searchArtistOnRYM(
              await getSelectedArtist(stateManager.getSelection("artist"))
            ),
        },
        { type: "separator" },
        {
          label: "Add Artist(s) to Group",
          id: "addArtistsToGroup",
          accelerator: "Shift+A",
          click: async () =>
            openModal("addArtistsToGroup", {
              artists: await getSelectedArtists(
                stateManager.getSelection("artist")
              ),
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
          label: "Open Release in Tagger",
          accelerator: "Shift+T",
          click: () =>
            controllers.system.openTagger(
              stateManager.getSelection("release").at(0)
            ),
        },
        {
          label: "Reveal Release in Finder",
          accelerator: "Shift+F",
          click: () =>
            controllers.system.revealEntityInFinder(
              "Release",
              stateManager.getSelection("release").at(0)
            ),
        },
        {
          label: "Refresh Folder Contents",
          accelerator: "Cmd+Shift+R",
          click: () =>
            controllers.importFolders.refreshReleaseContents(
              stateManager.getSelection("release").at(0)
            ),
        },
        {
          label: "Search Release Cover",
          accelerator: "Shift+C",
          click: async () =>
            controllers.release.importCovers(
              (await getSelectedReleases(
                stateManager.getSelection("release")
              )) as ReleaseWithArtistAndTracks[]
            ),
        },
        { type: "separator" },
        {
          label: "Search Release on Discogs",
          accelerator: "Shift+D",
          click: async () =>
            searchReleaseOnDiscogs(
              (await getRelease(
                stateManager.getSelection("release").at(0)
              )) as ReleaseWithArtist
            ),
        },
        {
          label: "Search Release on RYM",
          accelerator: "Shift+R",
          click: async () =>
            searchReleaseOnRYM(
              (await getRelease(
                stateManager.getSelection("release").at(0)
              )) as ReleaseWithArtist
            ),
        },
        {
          id: "editRelease",
          label: `Edit Release`,
          accelerator: "Cmd+Shift+E",
          click: async () =>
            openModal("editRelease", {
              release: (
                await getSelectedReleases(stateManager.getSelection("release"))
              ).at(0),
            }),
        },
        {
          id: "groupReleases",
          label: `Group Selected Releases`,
          accelerator: "Cmd+G",
          click: async () =>
            openModal("groupReleases", {
              releases: await getSelectedReleases(
                stateManager.getSelection("release")
              ),
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
              stateManager.getSelection("release")
            ),
        },
        {
          id: "addReleasesToCollection",
          label: `Add Selected Releases to Collection`,
          accelerator: "a",
          click: async () =>
            openModal("addReleasesToCollection", {
              releases: await getSelectedReleases(
                stateManager.getSelection("release")
              ),
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
              collection: await getCollection(
                stateManager.getSelection("collection").at(0)
              ),
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
              group: await getGroup(stateManager.getSelection("group").at(0)),
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
