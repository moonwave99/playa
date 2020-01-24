import { MenuItemConstructorOptions } from 'electron';
import { confirmDialog } from '../../dialog';

import {
  Playlist,
  deletePlaylistRequest,
} from '../../../store/modules/playlist';

import {
  playTrack,
  updateQueue
} from '../../../store/modules/player';

function playPlaylistActions(
  playlist: Playlist,
  dispatch: Function
): MenuItemConstructorOptions[] {
  return [
    {
      label: `Play playlist`,
      click: async (): Promise<void> => {
        const { _id: playlistId, albums } = playlist;
        if (albums.length === 0) {
          return;
        }
        dispatch(dispatch(updateQueue(albums)));
        dispatch(playTrack({ playlistId, albumId: albums[0] }));
      }
    }
  ];
}

function deletePlaylistActions(
  playlist: Playlist,
  dispatch: Function
): MenuItemConstructorOptions[] {
  return [
    {
      label: `Delete playlist`,
      click: async (): Promise<void> => {
        const confirmed = confirmDialog({
          title: 'Playlist Delete',
          message: `You are about to delete playlist '${playlist.title}', are you sure?`
        });
        if (confirmed) {
          dispatch(deletePlaylistRequest(playlist));
        }
      }
    }
  ];
}

export const PLAYLIST_LIST_CONTEXT_ACTIONS = 'playa/context-menu/playlist-list-actions';

export enum PlaylistListActionItems {
  PLAY_PLAYLIST,
  DELETE_PLAYLIST
}

export type GetPlaylistListContextMenuParams = {
  type: typeof PLAYLIST_LIST_CONTEXT_ACTIONS;
  playlist: Playlist;
  actions?: PlaylistListActionItems[];
  dispatch?: Function;
}

const actionsMap = {
  [PlaylistListActionItems.PLAY_PLAYLIST]: playPlaylistActions,
  [PlaylistListActionItems.DELETE_PLAYLIST]: deletePlaylistActions
};

export function getActions({
  playlist,
  actions = [
    PlaylistListActionItems.PLAY_PLAYLIST,
    PlaylistListActionItems.DELETE_PLAYLIST
  ],
  dispatch
}: GetPlaylistListContextMenuParams): MenuItemConstructorOptions[] {
  return actions.reduce((memo, action, index, original) => [
    ...memo,
    ...actionsMap[action](playlist, dispatch),
    ...index < original.length ? [{ type : 'separator'}] : []
  ], []);
}
