import { remote, MenuItemConstructorOptions } from 'electron';
const { Menu, MenuItem } = remote;

import {
  ALBUM_CONTEXT_ACTIONS,
  GetAlbumContextMenuParams,
  getActionGroups as getAlbumActionGroups
} from '../actions/albumActions';

import {
  PLAYLIST_LIST_CONTEXT_ACTIONS,
  GetPlaylistListContextMenuParams,
  getActionGroups as getPlaylistListActionGroups
} from '../actions/playlistListActions';

import {
  PLAYLIST_CONTENT_CONTEXT_ACTIONS,
  GetPlaylistContentContextMenuParams,
  getActionGroups as getPlaylistContextActionGroups
} from '../actions/playlistContentActions';

import {
  LIBRARY_CONTENT_CONTEXT_ACTIONS,
  GetLibraryContentContextMenuParams,
  getActionGroups as getLibraryContextActionGroups
} from '../actions/libraryContentActions';

type ContextMenuParams =
    GetPlaylistListContextMenuParams
  | GetPlaylistContentContextMenuParams
  | GetAlbumContextMenuParams
  | GetLibraryContentContextMenuParams;

export function openContextMenu(params: ContextMenuParams[]): void {
  const menu = new Menu();
  const groups: MenuItemConstructorOptions[][] = params.map((param) => {
    switch (param.type) {
      case PLAYLIST_LIST_CONTEXT_ACTIONS:
        return getPlaylistListActionGroups(param);
      case PLAYLIST_CONTENT_CONTEXT_ACTIONS:
        return getPlaylistContextActionGroups(param);
      case ALBUM_CONTEXT_ACTIONS:
        return getAlbumActionGroups(param);
      case LIBRARY_CONTENT_CONTEXT_ACTIONS:
        return getLibraryContextActionGroups(param);
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
