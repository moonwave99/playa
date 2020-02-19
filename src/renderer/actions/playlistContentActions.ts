import { MenuItemConstructorOptions } from 'electron';
import { ActionCreator } from './actions';

import {
  Playlist,
  savePlaylistRequest,
} from '../store/modules/playlist';

import { Album } from '../store/modules/album';

export type ActionParams = {
  playlist: Playlist;
  selection: Album['_id'][];
  dispatch?: Function;
}

export const removeAlbumAction: ActionCreator<ActionParams> = ({
  playlist,
  selection = [],
  dispatch
}) => {
  return {
    title: `Remove selected album(s) from playlist`,
    handler(): void { dispatch(savePlaylistRequest({
      ...playlist,
      albums: playlist.albums.filter(_id => selection.indexOf(_id) === -1)
    }))}
  };
}

export const PLAYLIST_CONTENT_CONTEXT_ACTIONS = 'playa/context-menu/playlist-content-actions';

export enum PlaylistContentActions {
  REMOVE_ALBUM = 'REMOVE_ALBUM'
}

export const PlaylistContentActionsMap = {
  [PlaylistContentActions.REMOVE_ALBUM]: removeAlbumAction
}

export enum PlaylistContentActionGroups {
  ALBUMS
}

export type GetPlaylistContentContextMenuParams = {
  type: typeof PLAYLIST_CONTENT_CONTEXT_ACTIONS;
  actionGroups?: PlaylistContentActionGroups[];
  playlist: Playlist;
  selection?: Album['_id'][];
  dispatch?: Function;
}

const actionGroupsMap = {
  [PlaylistContentActionGroups.ALBUMS]: [PlaylistContentActions.REMOVE_ALBUM],
};

export function getActionGroups({
  actionGroups = [PlaylistContentActionGroups.ALBUMS],
  playlist,
  selection,
  dispatch
}: GetPlaylistContentContextMenuParams): MenuItemConstructorOptions[] {
  return actionGroups.reduce((memo, group, index, original) => [
    ...memo,
    ...actionGroupsMap[group]
      .map(actionID => PlaylistContentActionsMap[actionID])
      .map(action => {
        const { title, handler } = action({ playlist, selection, dispatch });
        return { label: title, click: handler };
      }),
    ...index < original.length - 1 ? [{ type : 'separator'}] : []
  ], []);
}
