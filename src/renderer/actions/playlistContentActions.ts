import { MenuItemConstructorOptions } from 'electron';
import { ActionCreator, ActionGroupsMap, ActionMap, grouper } from './actionUtils';

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
  REMOVE_ALBUMS = 'REMOVE_ALBUMS'
}

export const PlaylistContentActionsMap: ActionMap<ActionParams> = {
  [PlaylistContentActions.REMOVE_ALBUMS]: removeAlbumsAction
}

export enum PlaylistContentActionGroups {
  ALBUMS = 'ALBUMS'
}

const actionGroupsMap: ActionGroupsMap = {
  [PlaylistContentActionGroups.ALBUMS]: [PlaylistContentActions.REMOVE_ALBUMS],
};

export type GetPlaylistContentContextMenuParams = ActionParams & {
  type: typeof PLAYLIST_CONTENT_CONTEXT_ACTIONS;
  actionGroups?: PlaylistContentActionGroups[];
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
