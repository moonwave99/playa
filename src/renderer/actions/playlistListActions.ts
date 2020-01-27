import { MenuItemConstructorOptions } from 'electron';
import { confirmDialog } from '../lib/dialog';

import {
  Playlist,
  deletePlaylistRequest,
} from '../store/modules/playlist';

import {
  playTrack,
  updateQueue
} from '../store/modules/player';

type ActionCreator = (actionParams: ActionParams) => Action;

type Action = {
  title: string;
  handler: Function;
}

type ActionParams = {
  playlist: Playlist;
  dispatch?: Function;
}

export const playPlaylistAction: ActionCreator = ({
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

export const deletePlaylistAction: ActionCreator = ({
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

export function mapAction(actionID: PlaylistListActions): ActionCreator {
  switch (actionID) {
    case PlaylistListActions.PLAY_PLAYLIST:
      return playPlaylistAction;
    case PlaylistListActions.DELETE_PLAYLIST:
      return deletePlaylistAction;
  }
}

export enum PlaylistListActionGroups {
  PLAYLIST,
}

export type GetPlaylistListContextMenuParams = {
  type: typeof PLAYLIST_LIST_CONTEXT_ACTIONS;
  actionGroups?: PlaylistListActionGroups[];
  playlist: Playlist;
  dispatch?: Function;
}

const actionGroupsMap = {
  [PlaylistListActionGroups.PLAYLIST]: [
    PlaylistListActions.PLAY_PLAYLIST,
    PlaylistListActions.DELETE_PLAYLIST
  ]
};

export function getActionGroups({
  actionGroups = [
    PlaylistListActionGroups.PLAYLIST
  ],
  playlist,
  dispatch
}: GetPlaylistListContextMenuParams): MenuItemConstructorOptions[] {
  return actionGroups.reduce((memo, group, index, original) => [
    ...memo,
    ...actionGroupsMap[group]
      .map(mapAction)
      .map(action => {
        const { title, handler } = action({ playlist, dispatch });
        return { label: title, click: handler };
      }),
    ...index < original.length ? [{ type : 'separator'}] : []
  ], []);
}
