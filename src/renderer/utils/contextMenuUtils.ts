import { remote, ipcRenderer as ipc } from 'electron';
const { Menu, MenuItem } = remote;

import { IPC_MESSAGES, SEARCH_URLS } from '../../constants';
const {
  IPC_SYS_REVEAL_IN_FINDER,
  IPC_SYS_OPEN_URL
} = IPC_MESSAGES;

export const RESULT_LIST_ITEM = 'RESULT_LIST_ITEM';

export enum ContextMenuTypes {
  RESULT_LIST_ITEM,
  ALBUM_COVER
}

interface IsAlbum {
  path: string;
  title: string;
  artist: string;
}

export interface ContextMenuOptions {
  type: ContextMenuTypes;
  context: IsAlbum;
}

export default function openContextMenu(options: ContextMenuOptions): void {
  const menu = new Menu();
  const query = `${options.context.artist} ${options.context.title}`;
  const fullTitle = `${options.context.artist} - ${options.context.title}`;
  switch (options.type) {
    case ContextMenuTypes.RESULT_LIST_ITEM:
    case ContextMenuTypes.ALBUM_COVER:
      menu.append(new MenuItem({
        label: `Show '${fullTitle}' in Finder`,
        click(): void {
          ipc.send(IPC_SYS_REVEAL_IN_FINDER, options.context.path);
        },
      }));
      menu.append(new MenuItem({
        label: `Search '${fullTitle}' on rateyourmusic`,
        click(): void {
          ipc.send(IPC_SYS_OPEN_URL, SEARCH_URLS.RYM, query);
        },
      }));
      menu.append(new MenuItem({
        label: `Search '${fullTitle}' on Discogs`,
        click(): void {
          ipc.send(IPC_SYS_OPEN_URL, SEARCH_URLS.DISCOGS, query);
        },
      }));
      break;
  }
  menu.popup({ window: remote.getCurrentWindow() });
}
