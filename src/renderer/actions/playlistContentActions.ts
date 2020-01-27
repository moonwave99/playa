import { MenuItemConstructorOptions } from 'electron';

import {
  Playlist,
  savePlaylistRequest,
} from '../store/modules/playlist';

import { Album } from '../store/modules/album';

type ActionCreator = (actionParams: ActionParams) => Action;

type Action = {
  title: string;
  handler: Function;
}

type ActionParams = {
  playlist: Playlist;
  selection: Album['_id'][];
  dispatch?: Function;
}

export const removeAlbumAction: ActionCreator = ({
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

export function mapAction(actionID: PlaylistContentActions): ActionCreator {
  switch (actionID) {
    case PlaylistContentActions.REMOVE_ALBUM:
      return removeAlbumAction;
  }
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
      .map(mapAction)
      .map(action => {
        const { title, handler } = action({ playlist, selection, dispatch });
        return { label: title, click: handler };
      }),
    ...index < original.length ? [{ type : 'separator'}] : []
  ], []);
}
