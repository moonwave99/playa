import { MenuItemConstructorOptions } from 'electron';
import { ActionCreator, ActionGroupsMap, ActionMap, grouper } from './actions';

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

export const removeAlbumsAction: ActionCreator<ActionParams> = ({
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

export const PlaylistContentActionsMap: ActionMap<ActionParams> = {
  [PlaylistContentActions.REMOVE_ALBUM]: removeAlbumsAction
}

export enum PlaylistContentActionGroups {
  ALBUMS = 'ALBUMS'
}

const actionGroupsMap: ActionGroupsMap = {
  [PlaylistContentActionGroups.ALBUMS]: [PlaylistContentActions.REMOVE_ALBUM],
};

export type GetPlaylistContentContextMenuParams = {
  type: typeof PLAYLIST_CONTENT_CONTEXT_ACTIONS;
  actionGroups?: PlaylistContentActionGroups[];
  playlist: Playlist;
  selection?: Album['_id'][];
  dispatch?: Function;
}

export function getActionGroups({
  actionGroups = [PlaylistContentActionGroups.ALBUMS],
  playlist,
  selection,
  dispatch
}: GetPlaylistContentContextMenuParams): MenuItemConstructorOptions[] {
  return grouper<ActionParams>({
    actionGroups,
    actionGroupsMap,
    actionParams: {
      playlist,
      selection,
      dispatch
    },
    actionsMap: PlaylistContentActionsMap
  });
}
