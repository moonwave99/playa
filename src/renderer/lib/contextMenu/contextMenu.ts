import { remote, MenuItemConstructorOptions } from 'electron';
const { Menu, MenuItem } = remote;

import {
  ALBUM_CONTEXT_ACTIONS,
  GetAlbumContextMenuParams,
  getActions as getAlbumActions
} from './actions/album';

import {
  PLAYLIST_LIST_CONTEXT_ACTIONS,
  GetPlaylistListContextMenuParams,
  getActions as getPlaylistListActions
} from './actions/playlistList';

import {
  PLAYLIST_CONTENT_CONTEXT_ACTIONS,
  GetPlaylistContentContextMenuParams,
  getActions as getPlaylistContextActions
} from './actions/playlistContent';

type ContextMenuParams =
    GetPlaylistListContextMenuParams
  | GetPlaylistContentContextMenuParams
  | GetAlbumContextMenuParams;

export function openContextMenu(params: ContextMenuParams[]): void {
  const menu = new Menu();
  const groups: MenuItemConstructorOptions[][] = params.map((param) => {
    switch (param.type) {
      case PLAYLIST_LIST_CONTEXT_ACTIONS:
        return getPlaylistListActions(param);
      case PLAYLIST_CONTENT_CONTEXT_ACTIONS:
        return getPlaylistContextActions(param);
      case ALBUM_CONTEXT_ACTIONS:
        return getAlbumActions(param);
    }
  });

  groups.forEach((group, index) => {
    group.forEach(item => menu.append(new MenuItem(item)));
    if (index < groups.length) {
      menu.append(new MenuItem({ type: 'separator' }));
    }
  });

  menu.popup({ window: remote.getCurrentWindow() });
}
