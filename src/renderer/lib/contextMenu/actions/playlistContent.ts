import { MenuItemConstructorOptions } from 'electron';

import {
  Playlist,
  savePlaylistRequest,
} from '../../../store/modules/playlist';

import { Album } from '../../../store/modules/album';

function removeAlbumActions(
  playlist: Playlist,
  selection: Album['_id'][],
  dispatch: Function
): MenuItemConstructorOptions[] {
  return [
    {
      label: `Remove selected album(s) from playlist`,
      click(): void { dispatch(savePlaylistRequest({
        ...playlist,
        albums: playlist.albums.filter(_id => selection.indexOf(_id) === -1)
      }))}
    }
  ];
}

export const PLAYLIST_CONTENT_CONTEXT_ACTIONS = 'playa/context-menu/playlist-content-actions';

export enum PlaylistContentActionItems {
  REMOVE_ALBUMS
}

export type GetPlaylistContentContextMenuParams = {
  type: typeof PLAYLIST_CONTENT_CONTEXT_ACTIONS;
  playlist: Playlist;
  selection?: Album['_id'][];
  actions?: PlaylistContentActionItems[];
  dispatch?: Function;
}

const actionsMap = {
  [PlaylistContentActionItems.REMOVE_ALBUMS]: removeAlbumActions,
};

export function getActions({
  playlist,
  selection,
  actions = [PlaylistContentActionItems.REMOVE_ALBUMS],
  dispatch
}: GetPlaylistContentContextMenuParams): MenuItemConstructorOptions[] {
  return actions.reduce((memo, action, index, original) => [
    ...memo,
    ...actionsMap[action](playlist, selection, dispatch),
    ...index < original.length ? [{ type : 'separator'}] : []
  ], []);
}
