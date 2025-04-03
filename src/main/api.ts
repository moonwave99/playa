import { ipcMain as ipc } from 'electron';
import type { IpcMainEvent } from 'electron';
import * as release from './db/release';
import * as artist from './db/artist';
import * as collection from './db/collection';
import * as search from './db/search';
import { playback, openTagger, refreshReleaseContents, downloadCover, startDrag, importCovers, renameRelease, renameArtist } from './system';
import { getSettings, setSettings } from './settings';
import { releaseMenu, artistMenu, collectionMenu, searchResultMenu } from './menu/menu';

function registerHandlers(entity: Record<string, (...args: unknown[]) => unknown>) {
  Object.entries(entity).forEach((([name, handler]) => {
    ipc.handle(name, (event: IpcMainEvent, ...params: Parameters<typeof handler>) => handler(...params, event))
  }));
}

const system = {
  playback,
  openTagger,
  refreshReleaseContents,
  downloadCover,
  startDrag,
  importCovers,
  renameRelease,
  renameArtist
};

const menu = {
  'menu:release': releaseMenu,
  'menu:artist': artistMenu,
  'menu:collection': collectionMenu,
  'menu:searchResult': searchResultMenu,
};

const settings = { setSettings, getSettings };

export default function registerApi() {
  [search, release, artist, collection, system, menu, settings].forEach(registerHandlers);
}