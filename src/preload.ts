import { contextBridge, ipcRenderer as ipc } from "electron";
import type { OpenDialogSyncOptions } from "electron";
import {
  getEventHandler,
  getHandlers,
  getHandlersFromActions,
  getEventHandlersFromActions,
} from "./handlerUtils";
import { getSettings, setSettings } from "./main/settings";
import type {
  ReleaseWithArtist,
  CollectionWithReleases,
  ArtistWithReleases,
  SearchResult,
  GroupWithArtists,
  Notification,
} from "./types/types";
import { QueryKey } from "@tanstack/react-query";
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
  stateController,
  actions as stateActions,
} from "./main/controllers/state";
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

const eventNames = Object.keys(getEvents());

const api = {
  artist:
    getHandlersFromActions<ReturnType<typeof artistController>>(artistActions),
  release:
    getHandlersFromActions<ReturnType<typeof releaseController>>(
      releaseActions
    ),
  collection:
    getHandlersFromActions<ReturnType<typeof collectionController>>(
      collectionActions
    ),
  group:
    getHandlersFromActions<ReturnType<typeof groupController>>(groupActions),
  stats:
    getHandlersFromActions<ReturnType<typeof statsController>>(statsActions),
  state:
    getHandlersFromActions<ReturnType<typeof stateController>>(stateActions),
  searchResult:
    getHandlersFromActions<ReturnType<typeof searchResultController>>(
      searchResultActions
    ),
  system:
    getHandlersFromActions<ReturnType<typeof systemController>>(systemActions),
  importFolders:
    getHandlersFromActions<ReturnType<typeof importFoldersController>>(
      importFoldersActions
    ),
  importExport:
    getHandlersFromActions<ReturnType<typeof importExportController>>(
      importExportActions
    ),
  events: getEventHandlersFromActions<ReturnType<typeof getEvents>>(
    eventNames as (keyof ReturnType<typeof getEvents>)[]
  ),
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
    refresh: () => ipc.invoke("menu:refresh"),
  },
  dialog: {
    open: async (options: Partial<OpenDialogSyncOptions>) =>
      ipc.invoke("dialog:open", options),
  },
  import: {
    onProgress: getEventHandler("import:progress"),
    onError: getEventHandler("import:error"),
  },
  export: {
    onProgress: getEventHandler("export:progress"),
    onError: getEventHandler("export:error"),
  },
};

export type Api = typeof api;

contextBridge.exposeInMainWorld("api", api);

function getEvents() {
  const noOp = (...args: unknown[]) => {
    void args;
  };
  return {
    onNavigate: (path: string) => noOp(path),
    onSwipe: (direction: number) => noOp(direction),
    onMutate: (queryKey: QueryKey) => noOp(queryKey),
    onNotify: (notification: Notification) => noOp(notification),
    onCoverUpdate: (selection: ReleaseWithArtist[]) => noOp(selection),
    onOpenGroupDialog: (selection: ReleaseWithArtist[]) => noOp(selection),
    onOpenEditReleaseDialog: (release: ReleaseWithArtist) => noOp(release),
    onOpenEditArtistDialog: (artist: ArtistWithReleases) => noOp(artist),
    onOpenEditCollectionDialog: (collection: CollectionWithReleases) =>
      noOp(collection),
    onOpenAddReleasesToCollectionDialog: (selection: ReleaseWithArtist[]) =>
      noOp(selection),
    onOpenAddArtistsToGroupDialog: (selection: ArtistWithReleases[]) =>
      noOp(selection),
    onOpenEditGroupDialog: (group: GroupWithArtists) => noOp(group),
    onClearSelection: () => {},
    onToggleViewMode: () => {},
    onToggleSearch: () => {},
    onOpenSettings: () => {},
    onOpenImportData: () => {},
    onOpenExportData: () => {},
    onOpenImportFolders: () => {},
  };
}
