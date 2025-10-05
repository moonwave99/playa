import { Menu, MenuItem, dialog } from "electron";
import type { MenuItemConstructorOptions } from "electron";
import type {
  Context,
  Entities,
  GroupWithArtists,
  WithReleases,
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
import type { StateManager, State } from "../state";
import { send } from "../controllers/init";

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
  if (!context) {
    return false;
  }
  if (context?.entityType === "Group") {
    return (context as GroupWithArtists)?.artists.length > 1;
  }
  if (context?.entityType === "Artist") {
    return (context as WithReleases)?.releases.length > 1;
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
      if (context.entityType === "Artist") {
        await controllers.artist.setArtistCoverRelease(
          context.id,
          selection_id
        );
        send("mutate", [
          ["artists", "latest"],
          ["artists", context.id],
        ]);
        return;
      }

      if (context.entityType === "Group") {
        await controllers.group.setGroupCoverArtist(context.id, selection_id);
        send("mutate", [
          ["group", "latest"],
          ["group", context.id],
        ]);
        return;
      }

      await controllers.collection.setCollectionCoverRelease(
        context.id,
        selection_id
      );
      send("mutate", [
        ["collections", "latest"],
        ["collections", context.id],
      ]);
    },
  };
}

type GetDeleteEntryParams = {
  title: string;
  deleteFn: () => Promise<unknown>;
  queryKeys: QueryKey;
};

export function getDeleteEntry({
  title,
  deleteFn,
  queryKeys,
}: GetDeleteEntryParams) {
  return {
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

function refreshMenu(
  menu: Menu,
  { isInputFocused, selectedReleases, currentArtist, isImporting }: State
) {
  ["navigate", "library"].forEach((id) => {
    menu.items
      .find((x) => x.id == id)
      .submenu.items.forEach((x) => (x.enabled = !isInputFocused));
  });

  menu.getMenuItemById("artist").submenu.items.forEach((item) => {
    if (isInputFocused) {
      item.enabled = false;
      return;
    }
    if (item.id === "refresh-releases") {
      item.enabled = currentArtist && !isImporting;
      return;
    }
    item.enabled = !!currentArtist;
  });

  menu.getMenuItemById("release").submenu.items.forEach((item) => {
    if (isInputFocused) {
      item.enabled = false;
      return;
    }
    item.enabled = selectedReleases.length === 1;
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
  state: StateManager;
  send: (channel: string, ...args: unknown[]) => void;
};

export function initMenu({ controllers, state, send }: InitMenuParams) {
  const menu = Menu.getApplicationMenu();

  menu.append(
    new MenuItem({
      id: "artist",
      label: "Artist",
      submenu: [
        {
          label: "Reveal Artist in Finder",
          accelerator: "Cmd+Shift+F",
          click: () =>
            controllers.system.revealEntityInFinder(
              "Artist",
              state.getCurrentArtist().id
            ),
        },
        {
          label: "Refresh all Releases content",
          accelerator: "Cmd+Shift+A",
          id: "refresh-releases",
          click: controllers.release.refreshCurrentArtistReleases,
        },
        {
          label: "Import missing covers",
          accelerator: "Cmd+Shift+C",
          click: () =>
            controllers.release.importMissingCovers(
              state.getCurrentArtist().releases
            ),
        },
        {
          label: "Edit Artist",
          accelerator: "Shift+E",
          click: () => send("openEditArtistDialog", state.getCurrentArtist()),
        },
        { type: "separator" },
        {
          label: "Search Artist on Discogs",
          accelerator: "Cmd+Shift+D",
          click: () => searchArtistOnDiscogs(state.getCurrentArtist()),
        },
        {
          label: "Search Artist on RYM",
          accelerator: "Shift+R",
          click: () => searchArtistOnRYM(state.getCurrentArtist()),
        },
        { type: "separator" },
        {
          label: `Add Artist to Group`,
          accelerator: "a",
          click: () =>
            send("openAddArtistsToGroupDialog", [state.getCurrentArtist()]),
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
              getArtistLink(state.getSelectedReleases()[0].artist)
            ),
        },
        {
          label: "Open Release in Tagger",
          accelerator: "Shift+T",
          click: () =>
            controllers.system.openTagger(state.getSelectedReleases()[0].id),
        },
        {
          label: "Reveal Release in Finder",
          accelerator: "Shift+F",
          click: () =>
            controllers.system.revealEntityInFinder(
              "Release",
              state.getSelectedReleases()[0].id
            ),
        },
        {
          label: "Refresh Folder Contents",
          accelerator: "Cmd+Shift+R",
          click: () =>
            controllers.release.refreshReleaseContents(
              state.getSelectedReleases()[0].id
            ),
        },
        {
          label: "Search Release Cover",
          accelerator: "Shift+C",
          click: () =>
            controllers.release.importCovers(state.getSelectedReleases()),
        },
        { type: "separator" },
        {
          label: "Search Release on Discogs",
          accelerator: "Shift+D",
          click: () => searchReleaseOnDiscogs(state.getSelectedReleases()[0]),
        },
        {
          label: "Search Release on RYM",
          accelerator: "Shift+R",
          click: () => searchReleaseOnRYM(state.getSelectedReleases()[0]),
        },
        {
          id: "editRelease",
          label: `Edit Release`,
          accelerator: "Cmd+Shift+E",
          click: () =>
            send("openEditReleaseDialog", state.getSelectedReleases().at(0)),
        },
        {
          id: "groupReleases",
          label: `Group Selected Releases`,
          accelerator: "Cmd+G",
          click: () => send("openGroupDialog", state.getSelectedReleases()),
        },
        {
          id: "unGroupRelease",
          label: `Ungroup Selected Release`,
          accelerator: "Cmd+Shift+G",
          visible: false,
          click: controllers.release.unGroupSelectedRelease,
        },
        {
          id: "addReleasesToCollection",
          label: `Add Selected Releases to Collection`,
          accelerator: "a",
          click: () =>
            send(
              "openAddReleasesToCollectionDialog",
              state.getSelectedReleases()
            ),
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
          click: () => send("openSettings"),
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
          label: "Import Folder",
          accelerator: "Shift+I",
          click: controllers.release.importFolderFromDialog,
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
          click: () => send("openImportData"),
        },
      ],
    })
  );

  Menu.setApplicationMenu(menu);

  return {
    refreshMenu: (state: State) => refreshMenu(menu, state),
  };
}
