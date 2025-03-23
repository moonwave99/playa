import { ipcMain as ipc } from 'electron';
import type { IpcMainEvent } from 'electron';
import * as release from './db/release';
import * as artist from './db/artist';
import * as collection from './db/collection';
import { revealEntityInFinder, playback, openTagger, refreshReleaseContents, downloadCover, startDrag } from './system';
import { releaseMenu, artistMenu, collectionMenu, searchResultMenu } from './menu/menu';

function registerHandlers(entity: Record<string, (...args: unknown[]) => unknown>) {
  Object.entries(entity).forEach((([name, handler]) => {
    ipc.handle(name, (event: IpcMainEvent, ...params: Parameters<typeof handler>) => handler(...params, event))
  }));
}

const system = { revealEntityInFinder, playback, openTagger, refreshReleaseContents, downloadCover, startDrag };
const menu = {
  'menu:release': releaseMenu,
  'menu:artist': artistMenu,
  'menu:collection': collectionMenu,
  'menu:searchResult': searchResultMenu,
}

export default function registerApi() {
  [release, artist, collection, system, menu].forEach(registerHandlers);
}