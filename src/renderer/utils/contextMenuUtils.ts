import { remote, ipcRenderer as ipc, MenuItemConstructorOptions } from 'electron';
const { Menu, MenuItem } = remote;
import { Album } from '../store/modules/album';
import { playTrack } from '../store/modules/player';
import { IPC_MESSAGES, SEARCH_URLS } from '../../constants';
const {
  IPC_SYS_REVEAL_IN_FINDER,
  IPC_SYS_OPEN_URL
} = IPC_MESSAGES;

export const RESULT_LIST_ITEM = 'RESULT_LIST_ITEM';

export enum AlbumActionItems {
  PLAYBACK,
  SYSTEM,
  SEARCH_ONLINE
}

function playbackActions(album: Album, dispatch: Function): MenuItemConstructorOptions[] {
  const { _id, artist, title } = album;
  const fullTitle = `${artist} - ${title}`;
  return [
    {
      label: `Play '${fullTitle}'`,
      click(): void { dispatch(playTrack({ albumId: _id })) }
    },
  ];
}

function systemActions(album: Album): MenuItemConstructorOptions[] {
  const { artist, title, path } = album;
  const fullTitle = `${artist} - ${title}`;
  return [
    {
      label: `Reveal '${fullTitle}' in Finder`,
      click(): void { ipc.send(IPC_SYS_REVEAL_IN_FINDER, path) }
    }
  ];
}

function searchOnlineActions(album: Album): MenuItemConstructorOptions[] {
  const { artist, title, } = album;
  const query = `${artist} ${title}`;
  const fullTitle = `${artist} - ${title}`;
  return [
    {
      label: `Search '${fullTitle}' on rateyourmusic`,
      click(): void { ipc.send(IPC_SYS_OPEN_URL, SEARCH_URLS.RYM, query) }
    },
    {
      label: `Search '${fullTitle}' on Discogs`,
      click(): void { ipc.send(IPC_SYS_OPEN_URL, SEARCH_URLS.DISCOGS, query) }
    }
  ]
}

type OpenAlbumContextMenuParams = {
  album: Album;
  actions: AlbumActionItems[];
  dispatch?: Function;
}

// #TODO:
// 1. remove from playlist
// 2. play after current
// 3. enqueue
export function openAlbumContextMenu({
  album,
  actions = [],
  dispatch
}: OpenAlbumContextMenuParams): void {
  const menu = new Menu();
  actions.reduce((memo, action, index, original) => {
    switch (action) {
      case AlbumActionItems.PLAYBACK:
        return [
          ...memo,
          ...playbackActions(album, dispatch),
          ...index < original.length ? [{ type : 'separator'}] : []
        ];
      case AlbumActionItems.SYSTEM:
        return [
          ...memo,
          ...systemActions(album),
          ...index < original.length ? [{ type : 'separator'}] : []
        ];
      case AlbumActionItems.SEARCH_ONLINE:
        return [
          ...memo,
          ...searchOnlineActions(album),
          ...index < original.length ? [{ type : 'separator'}] : []
        ];
      default:
        return memo;
    }
  }, []).forEach(item => menu.append(new MenuItem(item)));
  menu.popup({ window: remote.getCurrentWindow() });
}
