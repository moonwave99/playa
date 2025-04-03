import { contextBridge, ipcRenderer as ipc } from "electron";
import type { IpcRendererEvent, OpenDialogSyncOptions } from "electron";
import * as search from "./main/db/search";
import * as release from "./main/db/release";
import * as artist from "./main/db/artist";
import * as collection from "./main/db/collection";
import { openTagger, refreshReleaseContents, playback, downloadCover, startDrag, importCovers, editRelease, editArtist } from "./main/system";
import { getSettings, setSettings } from "./main/settings";
import type { ReleaseWithArtist, CollectionWithReleases, ArtistWithReleases, SearchResult, ReleaseWithArtistAndSubreleases } from "./types/types";

contextBridge.exposeInMainWorld('api', {
  data: {
    ...getHandlers(search),
    ...getHandlers(release),
    ...getHandlers(artist),
    ...getHandlers(collection),
  },
  system: getHandlers({
    openTagger,
    refreshReleaseContents,
    playback,
    downloadCover,
    startDrag,
    importCovers,
    editRelease,
    editArtist
  }),
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
    toggleSidebar: (showSidebar?: boolean) => ipc.send('state:toggleSidebar', showSidebar)
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