import { MenuItemConstructorOptions } from 'electron';
import { ActionCreator, ActionGroupsMap, ActionMap, grouper } from './actionUtils';
import { confirmDialog } from '../lib/dialog';

import {
  Playlist,
  deletePlaylistRequest,
} from '../store/modules/playlist';

import {
  playTrack,
  updateQueue
} from '../store/modules/player';

export type ActionParams = {
  playlist: Playlist;
  dispatch?: Function;
}

export const playPlaylistAction: ActionCreator<ActionParams> = ({
  playlist,
  dispatch
}) => {
  return {
    title: `Play playlist`,
    handler: async (): Promise<void> => {
      const { _id: playlistId, albums } = playlist;
      if (albums.length === 0) {
        return;
      }
      dispatch(updateQueue(albums));
      dispatch(playTrack({ playlistId, albumId: albums[0] }));
    }
  };
}

export const deletePlaylistAction: ActionCreator<ActionParams> = ({
  playlist,
  dispatch
}) => {
  return {
    title: `Delete playlist`,
    handler: async (): Promise<void> => {
      const confirmed = await confirmDialog({
        title: 'Playlist Delete',
        message: `You are about to delete playlist '${playlist.title}', are you sure?`
      });
      if (confirmed) {
        dispatch(deletePlaylistRequest(playlist));
      }
    }
  };
}

export const PLAYLIST_LIST_CONTEXT_ACTIONS = 'playa/context-menu/playlist-list-actions';

export enum PlaylistListActions {
  PLAY_PLAYLIST = 'PLAY_PLAYLIST',
  DELETE_PLAYLIST = 'DELETE_PLAYLIST'
}

export const PlaylistListActionsMap: ActionMap<ActionParams> = {
  [PlaylistListActions.PLAY_PLAYLIST]: playPlaylistAction,
  [PlaylistListActions.DELETE_PLAYLIST]: deletePlaylistAction
}

export enum PlaylistListActionGroups {
  PLAYLIST = 'PLAYLIST'
}

const actionGroupsMap: ActionGroupsMap = {
  [PlaylistListActionGroups.PLAYLIST]: [
    PlaylistListActions.PLAY_PLAYLIST,
    PlaylistListActions.DELETE_PLAYLIST
  ]
};

export type GetPlaylistListContextMenuParams = {
  type: typeof PLAYLIST_LIST_CONTEXT_ACTIONS;
  actionGroups?: PlaylistListActionGroups[];
  playlist: Playlist;
  dispatch?: Function;
}

export function getActionGroups({
  actionGroups = [
    PlaylistListActionGroups.PLAYLIST
  ],
  playlist,
  dispatch
}: GetPlaylistListContextMenuParams): MenuItemConstructorOptions[] {
  return grouper<ActionParams>({
    actionGroups,
    actionGroupsMap,
    actionParams: {
      playlist,
      dispatch
    },
    actionsMap: PlaylistListActionsMap
  });
}
