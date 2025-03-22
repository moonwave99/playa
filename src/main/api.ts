import { ipcMain as ipc } from 'electron';
import type { IpcMainEvent } from 'electron';
import * as release from './db/release';
import * as artist from './db/artist';
import * as collection from './db/collection';
import { revealEntityInFinder, playback, refreshReleaseContents, downloadCover } from './system';
import { releaseMenu, artistMenu, collectionMenu, searchResultMenu } from './menu/menu';

function registerHandlers(entity: Record<string, (...args: unknown[]) => unknown>) {
  Object.entries(entity).forEach((([name, handler]) => {
    ipc.handle(name, (_: IpcMainEvent, ...params: Parameters<typeof handler>) => handler(...params))
  }));
}

const system = { revealEntityInFinder, playback, refreshReleaseContents, downloadCover };
const menu = {
  'menu:release': releaseMenu,
  'menu:artist': artistMenu,
  'menu:collection': collectionMenu,
  'menu:searchResult': searchResultMenu,
}

export default function registerApi() {
  [release, artist, collection, system, menu].forEach(registerHandlers);
}