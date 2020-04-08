import { MenuItemConstructorOptions } from 'electron';
import { ActionCreator, ActionGroupsMap, ActionMap, grouper } from './actionUtils';
import { confirmDialog } from '../lib/dialog';

import {
  Playlist,
  deletePlaylistListRequest,
} from '../store/modules/playlist';

import {
  playTrack,
  updateQueue
} from '../store/modules/player';

export type ActionParams = {
  playlists: Playlist[];
  dispatch?: Function;
}

export const playPlaylistAction: ActionCreator<ActionParams> = ({
  playlists,
  dispatch
}) => {
  return {
    title: `Play playlist`,
    handler: async (): Promise<void> => {
      const { _id: playlistId, albums } = playlists[0];
      if (albums.length === 0) {
        return;
      }
      dispatch(updateQueue(albums));
      dispatch(playTrack({ playlistId, albumId: albums[0] }));
    }
  };
}

export const deletePlaylistsAction: ActionCreator<ActionParams> = ({
  playlists,
  dispatch
}) => {
  return {
    title: `Remove playlist`,
    handler: async (): Promise<void> => {
      const confirmed = await confirmDialog({
        title: 'Remove playlist',
        message: `You are about to delete ${playlists.length} playlist(s), are you sure?`
      });
      if (confirmed) {
        dispatch(deletePlaylistListRequest(playlists));
      }
    }
  };
}

export const PLAYLIST_LIST_CONTEXT_ACTIONS = 'playa/context-menu/playlist-list-actions';

export enum PlaylistListActions {
  PLAY_PLAYLIST = 'PLAY_PLAYLIST',
  DELETE_PLAYLISTS = 'DELETE_PLAYLIST'
}

export const PlaylistListActionsMap: ActionMap<ActionParams> = {
  [PlaylistListActions.PLAY_PLAYLIST]: playPlaylistAction,
  [PlaylistListActions.DELETE_PLAYLISTS]: deletePlaylistsAction
}

export enum PlaylistListActionGroups {
  PLAYLIST = 'PLAYLIST'
}

const actionGroupsMap: ActionGroupsMap = {
  [PlaylistListActionGroups.PLAYLIST]: [
    PlaylistListActions.PLAY_PLAYLIST,
    PlaylistListActions.DELETE_PLAYLISTS
  ]
};

export type GetPlaylistListContextMenuParams = ActionParams & {
  type: typeof PLAYLIST_LIST_CONTEXT_ACTIONS;
  actionGroups?: PlaylistListActionGroups[];
}

export function getActionGroups({
  actionGroups = [
    PlaylistListActionGroups.PLAYLIST
  ],
  playlists,
  dispatch
}: GetPlaylistListContextMenuParams): MenuItemConstructorOptions[] {
  return grouper<ActionParams>({
    actionGroups,
    actionGroupsMap,
    actionParams: {
      playlists,
      dispatch
    },
    actionsMap: PlaylistListActionsMap
  });
}
