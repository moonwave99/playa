import { contextBridge, ipcRenderer as ipc } from "electron";
import type { IpcRendererEvent } from "electron";
import * as release from "./main/db/release";
import * as artist from "./main/db/artist";
import * as collection from "./main/db/collection";
import { revealEntityInFinder, refreshReleaseContents, playback, downloadCover, startDrag } from "./main/system";
import { getSettings, setSettings } from "./main/settings";
import type { ReleaseWithArtist, CollectionWithReleases, ArtistWithReleases, SearchResult } from "./types/types";

contextBridge.exposeInMainWorld('api', {
  data: {
    ...getHandlers(release),
    ...getHandlers(artist),
    ...getHandlers(collection),
  },
  system: getHandlers({ revealEntityInFinder, refreshReleaseContents, playback, downloadCover, startDrag }),
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
  onMutate: getHandler('mutate'),
  onClearSelection: getHandler('clearSelection'),
  onToggleViewMode: getHandler('toggleViewMode'),
  onOpenSettings: getHandler('openSettings'),
  ui: {
    inputFocus: () => ipc.send('ui', 'inputFocus'),
    inputBlur: () => ipc.send('ui', 'inputBlur'),
  },
});

function getHandlers(entity: Record<string, (...args: unknown[]) => unknown>) {
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