import { remote, ipcRenderer as ipc, MenuItemConstructorOptions } from 'electron';
const { Menu, MenuItem } = remote;
import { playTrack } from '../store/modules/player';
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
  _id: string;
  path: string;
  title: string;
  artist: string;
}

export interface ContextMenuOptions {
  type: ContextMenuTypes;
  context: IsAlbum;
}

export default function openContextMenu(options: ContextMenuOptions, dispatch?: Function): void {
  const menu = new Menu();
  const query = `${options.context.artist} ${options.context.title}`;
  const fullTitle = `${options.context.artist} - ${options.context.title}`;
  let menuItems: MenuItemConstructorOptions[];
  switch (options.type) {
    case ContextMenuTypes.RESULT_LIST_ITEM:
    case ContextMenuTypes.ALBUM_COVER:
      menuItems = [
        {
          label: `Play '${fullTitle}'`,
          click(): void { dispatch(playTrack({ albumId: options.context._id })) }
        },
        { type: 'separator' },
        {
          label: `Reveal '${fullTitle}' in Finder`,
          click(): void { ipc.send(IPC_SYS_REVEAL_IN_FINDER, options.context.path) }
        },
        { type: 'separator' },
        {
          label: `Search '${fullTitle}' on rateyourmusic`,
          click(): void { ipc.send(IPC_SYS_OPEN_URL, SEARCH_URLS.RYM, query) }
        },
        {
          label: `Search '${fullTitle}' on rateyourmusic`,
          click(): void { ipc.send(IPC_SYS_OPEN_URL, SEARCH_URLS.RYM, query) }
        },
        {
          label: `Search '${fullTitle}' on Discogs`,
          click(): void { ipc.send(IPC_SYS_OPEN_URL, SEARCH_URLS.DISCOGS, query) }
        }
      ];
      break;
  }
  menuItems.forEach(item => menu.append(new MenuItem(item)));
  menu.popup({ window: remote.getCurrentWindow() });
}
