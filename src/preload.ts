import { contextBridge, ipcRenderer as ipc } from "electron";
import type { IpcRendererEvent, OpenDialogSyncOptions } from "electron";
import { getSettings, setSettings } from "./main/settings";
import type {
  ReleaseWithArtist,
  CollectionWithReleases,
  ArtistWithReleases,
  SearchResult,
  ReleaseWithArtistAndSubReleases,
  GroupWithArtists,
} from "./types/types";
import {
  systemController,
  actions as systemActions,
} from "./main/controllers/system";
import {
  actions as artistActions,
  artistController,
} from "./main/controllers/artist";
import {
  releaseController,
  actions as releaseActions,
} from "./main/controllers/release";
import {
  actions as collectionActions,
  collectionController,
} from "./main/controllers/collection";
import {
  actions as groupActions,
  groupController,
} from "./main/controllers/group";
import {
  statsController,
  actions as statsActions,
} from "./main/controllers/stats";
import {
  actions as searchResultActions,
  searchResultController,
} from "./main/controllers/searchResult";
import {
  actions as importFoldersActions,
  importFoldersController,
} from "./main/controllers/importFolders";
import {
  actions as importExportActions,
  importExportController,
} from "./main/controllers/importExport";

const api = {
  artist: getHandlersFromActions(artistActions) as ReturnType<
    typeof artistController
  >,
  release: getHandlersFromActions(releaseActions) as ReturnType<
    typeof releaseController
  >,
  collection: getHandlersFromActions(collectionActions) as ReturnType<
    typeof collectionController
  >,
  group: getHandlersFromActions(groupActions) as ReturnType<
    typeof groupController
  >,
  stats: getHandlersFromActions(statsActions) as ReturnType<
    typeof statsController
  >,
  searchResult: getHandlersFromActions(searchResultActions) as ReturnType<
    typeof searchResultController
  >,
  system: getHandlersFromActions(systemActions) as ReturnType<
    typeof systemController
  >,
  importFolders: getHandlersFromActions(importFoldersActions) as ReturnType<
    typeof importFoldersController
  >,
  importExport: getHandlersFromActions(importExportActions) as ReturnType<
    typeof importExportController
  >,
  settings: getHandlers({ getSettings, setSettings }),
  menu: {
    release: (
      selection: ReleaseWithArtist[],
      context?: CollectionWithReleases | ArtistWithReleases
    ) => ipc.invoke("menu:release", selection, context),
    artist: (artist: ArtistWithReleases, context?: GroupWithArtists) =>
      ipc.invoke("menu:artist", artist, context),
    collection: (collection: CollectionWithReleases) =>
      ipc.invoke("menu:collection", collection),
    group: (group: GroupWithArtists) => ipc.invoke("menu:group", group),
    searchResult: (result: SearchResult) =>
      ipc.invoke("menu:searchResult", result),
  },
  onNavigate: getHandler("navigate"),
  onSwipe: getHandler("swipe"),
  onMutate: getHandler("mutate"),
  onNotify: getHandler("notify"),
  onClearSelection: getHandler("clearSelection"),
  onToggleViewMode: getHandler("toggleViewMode"),
  onToggleSearch: getHandler("toggleSearch"),
  onOpenSettings: getHandler("openSettings"),
  onOpenImportData: getHandler("openImportData"),
  onOpenExportData: getHandler("openExportData"),
  onOpenImportFolders: getHandler("openImportFolders"),
  onCoverUpdate: getHandler("coverUpdate"),
  onOpenGroupDialog: getHandler("openGroupDialog"),
  onOpenEditReleaseDialog: getHandler("openEditReleaseDialog"),
  onOpenEditArtistDialog: getHandler("openEditArtistDialog"),
  onOpenEditCollectionDialog: getHandler("openEditCollectionDialog"),
  onOpenAddReleasesToCollectionDialog: getHandler(
    "openAddReleasesToCollectionDialog"
  ),
  onOpenAddArtistsToGroupDialog: getHandler("openAddArtistsToGroupDialog"),
  onOpenEditGroupDialog: getHandler("openEditGroupDialog"),
  state: {
    setInputFocused: (inputFocused: boolean) =>
      ipc.send("state:setInputFocused", inputFocused),
    selectReleases: (selection: ReleaseWithArtistAndSubReleases[]) =>
      ipc.send("state:selectReleases", selection),
    navigate: (path: string) => ipc.send("state:navigate", path),
    clearSelection: () => ipc.send("state:clearSelection"),
    refreshCurrentArtist: () => ipc.send("state:refreshCurrentArtist"),
    refreshMenu: () => ipc.send("state:refreshMenu"),
  },
  dialog: {
    open: async (options: Partial<OpenDialogSyncOptions>) =>
      ipc.invoke("dialog:open", options),
  },
  import: {
    onProgress: getHandler("import:progress"),
    onError: getHandler("import:error"),
  },
  export: {
    onProgress: getHandler("export:progress"),
    onError: getHandler("export:error"),
  },
};

export type Api = typeof api;

contextBridge.exposeInMainWorld("api", api);

function getHandlers(entity: Record<string, (...args: unknown[]) => unknown>) {
  return Object.entries(entity).reduce(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (memo, [name, handler]) => {
      return {
        ...memo,
        [name]: (...params: Parameters<typeof handler>) =>
          ipc.invoke(name, ...params),
      };
    },
    {} as Record<keyof typeof entity, (...args: unknown[]) => Promise<unknown>>
  );
}

function getHandler(name: string): (...args: unknown[]) => () => void {
  return (handler: (...args: unknown[]) => void) => {
    function withoutEvent(
      _: IpcRendererEvent,
      ...args: Parameters<typeof handler>
    ) {
      handler(...args);
    }
    ipc.on(name, withoutEvent);
    return () => {
      ipc.off(name, withoutEvent);
    };
  };
}

function getHandlersFromActions(actionNames: string[]) {
  return actionNames.reduce(
    (memo, name) => ({
      ...memo,
      [name]: (...params: unknown[]) => ipc.invoke(name as string, ...params),
    }),
    {}
  );
}
