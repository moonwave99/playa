import { MenuItemConstructorOptions, ipcRenderer as ipc } from 'electron';
import { confirmDialog } from '../lib/dialog'
import { ActionCreator, ActionGroupsMap, ActionMap, grouper } from './actionUtils';

import { removeAlbums } from '../store/modules/library';
import { showDialog } from '../store/modules/ui';
import { Album } from '../store/modules/album';

import { IPC_MESSAGES } from '../../constants';
const { IPC_UI_MENU_REMOTE_CALL } = IPC_MESSAGES;

export type ActionParams = {
  selection: Album['_id'][];
  currentAlbumId: Album['_id'];
  dispatch?: Function;
}

export const removeAlbumsAction: ActionCreator<ActionParams> = ({
  selection = [],
  currentAlbumId,
  dispatch
}) => {
  return {
    title: `Remove selected album(s) from library`,
    async handler(): Promise<Function> {
      if (selection.indexOf(currentAlbumId) > -1) {
        return dispatch(showDialog('Album in play', 'Album is currently in playback!'));
      }
      const confirmed = await confirmDialog({
        title: 'Remove selected album(s) from library',
        message: `You are about to delete ${selection.length} album(s) from your library, are you sure?`
      });
      if (confirmed) {
        return dispatch(removeAlbums(selection));
      }
      return function(): void { return; };
    }
  };
}

export const addAlbumsToPlaylistAction: ActionCreator<ActionParams> = () => {
  return {
    title: `Add selected album(s) to playlist`,
    async handler(): Promise<Function> {
      ipc.send(IPC_UI_MENU_REMOTE_CALL, 'add-albums-to-playlist');
      return function(): void { return; };
    }
  };
}

export const LIBRARY_CONTENT_CONTEXT_ACTIONS = 'playa/context-menu/library-content-actions';

export enum LibraryContentActions {
  REMOVE_ALBUMS = 'REMOVE_ALBUMS_FROM_LIBRARY',
  ADD_ALBUMS_TO_PLAYLIST = 'ADD_ALBUMS_TO_PLAYLIST'
}

export const LibraryContentActionsMap: ActionMap<ActionParams> = {
  [LibraryContentActions.REMOVE_ALBUMS]: removeAlbumsAction,
  [LibraryContentActions.ADD_ALBUMS_TO_PLAYLIST]: addAlbumsToPlaylistAction
}

export enum LibraryContentActionGroups {
  ALBUMS = 'ALBUMS'
}

const actionGroupsMap: ActionGroupsMap = {
  [LibraryContentActionGroups.ALBUMS]: [
    LibraryContentActions.REMOVE_ALBUMS,
    LibraryContentActions.ADD_ALBUMS_TO_PLAYLIST
  ]
};

export type GetLibraryContentContextMenuParams = {
  type: typeof LIBRARY_CONTENT_CONTEXT_ACTIONS;
  actionGroups?: LibraryContentActionGroups[];
  currentAlbumId?: Album['_id'];
  selection?: Album['_id'][];
  dispatch?: Function;
}

export function getActionGroups({
  actionGroups = [LibraryContentActionGroups.ALBUMS],
  selection,
  currentAlbumId,
  dispatch
}: GetLibraryContentContextMenuParams): MenuItemConstructorOptions[] {
  return grouper<ActionParams>({
    actionGroups,
    actionGroupsMap,
    actionParams: {
      selection,
      currentAlbumId,
      dispatch
    },
    actionsMap: LibraryContentActionsMap
  });
}
