import { contextBridge, ipcRenderer as ipc } from "electron";
import type { IpcRendererEvent, OpenDialogSyncOptions } from "electron";
import { getSettings, setSettings } from "./main/settings";
import type { ReleaseWithArtist, CollectionWithReleases, ArtistWithReleases, SearchResult, ReleaseWithArtistAndSubreleases } from "./types/types";

import { actions as systemActions } from "./main/controllers/system";
import { actions as artistActions } from "./main/controllers/artist";
import { actions as releaseActions } from "./main/controllers/release";
import { actions as collectionActions } from "./main/controllers/collection";
import { actions as searchActions } from "./main/controllers/search";

function getHandlersFromActions(controllerName: string, actionNames: string[]) {
  return {
    [controllerName]: actionNames.reduce((memo, name) => ({
      ...memo,
      [name]: (...params: unknown[]) => ipc.invoke(name, ...params)
    }), {})
  };
}

contextBridge.exposeInMainWorld('api', {
  ...getHandlersFromActions('artist', artistActions),
  ...getHandlersFromActions('release', releaseActions),
  ...getHandlersFromActions('collection', collectionActions),
  ...getHandlersFromActions('search', searchActions),
  ...getHandlersFromActions('system', systemActions),
  settings: getHandlers({ getSettings, setSettings }),
  menu: {
    'release': (
      selection: ReleaseWithArtist[],
      target_id: number,
      context?: CollectionWithReleases | ArtistWithReleases
    ) => ipc.invoke('menu:release', selection, target_id, context),
    'artist': (artist: ArtistWithReleases) => ipc.invoke('menu:artist', artist),
    'collection': (collection: CollectionWithReleases) => ipc.invoke('menu:collection', collection),
    'searchResult': (result: SearchResult) => ipc.invoke('menu:searchResult', result),
  },
  onNavigateSidebar: getHandler('navigateSidebar'),
  onNavigate: getHandler('navigate'),
  onSwipe: getHandler('swipe'),
  onMutate: getHandler('mutate'),
  onClearSelection: getHandler('clearSelection'),
  onToggleViewMode: getHandler('toggleViewMode'),
  onToggleSidebar: getHandler('toggleSidebar'),
  onOpenSettings: getHandler('openSettings'),
  onCoverUpdate: getHandler('coverUpdate'),
  onOpenGroupDialog: getHandler('openGroupDialog'),
  onOpenEditReleaseDialog: getHandler('openEditReleaseDialog'),
  onOpenEditArtistDialog: getHandler('openEditArtistDialog'),
  state: {
    setInputFocused: (inputFocused: boolean) => ipc.send('state:setInputFocused', inputFocused),
    selectReleases: (selection: ReleaseWithArtistAndSubreleases[]) => ipc.send('state:selectReleases', selection),
    navigate: (path: string) => ipc.send('state:navigate', path),
    clearSelection: () => ipc.send('state:clearSelection'),
    toggleSidebar: (showSidebar?: boolean) => ipc.send('state:toggleSidebar', showSidebar),
    refreshMenu: () => ipc.send('state:refreshMenu'),
  },
  dialog: {
    open: async (
      options: Partial<OpenDialogSyncOptions>
    ) => ipc.invoke('dialog:open', options),
  }
});

function getHandlers(entity: Record<string, (...args: unknown[]) => unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Object.entries(entity).reduce(((memo, [name, handler]) => {
    return {
      ...memo,
      [name]: (...params: Parameters<typeof handler>) => ipc.invoke(name, ...params)
    };
  }), {} as Record<keyof typeof entity, typeof entity>);
}

function getHandler(name: string): (...args: unknown[]) => void {
  return (handler: (...args: unknown[]) => void) => {
    function withoutEvent(_: IpcRendererEvent, ...args: Parameters<typeof handler>) {
      handler(...args);
    }
    ipc.on(name, withoutEvent);
    return () => {
      ipc.off(name, withoutEvent);
    };
  }
}