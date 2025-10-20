import { contextBridge, ipcRenderer as ipc } from "electron";
import type { OpenDialogSyncOptions } from "electron";
import {
  getHandlersFromActions,
  getEventHandlersFromActions,
} from "./handlerUtils";
import { QueryKey } from "@tanstack/react-query";
import type {
  ReleaseWithArtist,
  CollectionWithReleases,
  ArtistWithReleases,
  SearchResult,
  GroupWithArtists,
  Notification,
  WithReleases,
} from "./types/types";
import type { Modals } from "./renderer/Modal";
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
  settingsController,
  actions as settingsActions,
} from "./main/controllers/settings";
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

const eventNames = Object.keys(getEvents()) as (keyof ReturnType<
  typeof getEvents
>)[];

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
  settings:
    getHandlersFromActions<ReturnType<typeof settingsController>>(
      settingsActions
    ),
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
  events: getEventHandlersFromActions<ReturnType<typeof getEvents>>(eventNames),
  menu: {
    release: (
      selection: ReleaseWithArtist[],
      context?: WithReleases & { entityType: "Artist" | "Collection" | null }
    ) => ipc.invoke("menu:release", selection, context),
    artist: (artist: ArtistWithReleases, context?: GroupWithArtists) =>
      ipc.invoke("menu:artist", artist, context),
    collection: (collection: CollectionWithReleases) =>
      ipc.invoke("menu:collection", collection),
    group: (group: GroupWithArtists) => ipc.invoke("menu:group", group),
    searchResult: (result: SearchResult) =>
      ipc.invoke("menu:searchResult", result),
    refresh: () => ipc.invoke("menu:refresh"),
    click: (id: string) => ipc.invoke("menu:click", id),
  },
  dialog: {
    open: async (options: Partial<OpenDialogSyncOptions>) =>
      ipc.invoke("dialog:open", options),
  },
};

export type Api = typeof api;

contextBridge.exposeInMainWorld("api", api);

const noOp = (...args: unknown[]) => {
  void args;
};

function getEvents() {
  return {
    onNavigate: (path: string) => noOp(path),
    onSwipe: (direction: number) => noOp(direction),
    onMutate: (queryKey: QueryKey) => noOp(queryKey),
    onNotify: (notification: Notification) => noOp(notification),
    onCoverUpdate: (selection: ReleaseWithArtist[]) => noOp(selection),
    onImportProgress: (step: string, completed: boolean) =>
      noOp(step, completed),
    onImportError: (message: string) => noOp(message),
    onExportProgress: (step: string, completed: boolean) =>
      noOp(step, completed),
    onExportError: (message: string) => noOp(message),
    onOpenModal: ({
      name,
      params,
    }: {
      name: Modals;
      params: Record<string, unknown>;
    }) => noOp(name, params),
    onClearSelection: () => {},
    onToggleViewMode: () => {},
    onToggleSearch: () => {},
    onOpenSettings: () => {},
    onOpenImportData: () => {},
    onOpenExportData: () => {},
    onOpenImportFolders: () => {},
  };
}
