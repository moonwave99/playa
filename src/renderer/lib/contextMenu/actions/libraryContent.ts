import { MenuItemConstructorOptions } from 'electron';
import { confirmDialog } from '../../dialog'

import {
  removeAlbums,
} from '../../../store/modules/library';

import { Album } from '../../../store/modules/album';

function removeAlbumActions(
  selection: Album[],
  playingAlbumID: Album['_id'],
  dispatch: Function,
): MenuItemConstructorOptions[] {
  return [
    {
      label: `Remove selected album(s) from library`,
      click(): void {
        if (selection.map(({ _id }) => _id).indexOf(playingAlbumID) > -1) {
          confirmDialog({
            title: 'Album in play',
            message: 'Album is currently in playback!'
          });
          return;
        }
        const confirmed = confirmDialog({
          title: 'Playlist Delete',
          message: `You are about to delete ${selection.length} album(s) from your library, are you sure?`
        });
        if (confirmed) {
          dispatch(removeAlbums(selection));
        }
      }
    }
  ];
}

export const LIBRARY_CONTENT_CONTEXT_ACTIONS = 'playa/context-menu/library-content-actions';

export enum LibraryContentActionItems {
  REMOVE_ALBUMS
}

export type GetLibraryContentContextMenuParams = {
  type: typeof LIBRARY_CONTENT_CONTEXT_ACTIONS;
  playingAlbumID?: Album['_id'];
  selection?: Album[];
  actions?: LibraryContentActionItems[];
  dispatch?: Function;
}

const actionsMap = {
  [LibraryContentActionItems.REMOVE_ALBUMS]: removeAlbumActions,
};

export function getActions({
  selection,
  playingAlbumID,
  actions = [LibraryContentActionItems.REMOVE_ALBUMS],
  dispatch
}: GetLibraryContentContextMenuParams): MenuItemConstructorOptions[] {
  return actions.reduce((memo, action, index, original) => [
    ...memo,
    ...actionsMap[action](selection, playingAlbumID, dispatch),
    ...index < original.length ? [{ type : 'separator'}] : []
  ], []);
}
