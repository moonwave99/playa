import { MenuItemConstructorOptions } from 'electron';
import { confirmDialog } from '../lib/dialog'

import {
  removeAlbums,
} from '../store/modules/library';

import { showDialog } from '../store/modules/ui';
import { Album } from '../store/modules/album';

type ActionCreator = (actionParams: ActionParams) => Action;

type Action = {
  title: string;
  handler: Function;
}

type ActionParams = {
  selection: Album[];
  playingAlbumID: Album['_id'];
  dispatch?: Function;
}

export const removeAlbumsAction: ActionCreator = ({
  selection = [],
  playingAlbumID,
  dispatch
}) => {
  return {
    title: `Remove selected album(s) from library`,
    async handler(): Promise<void> {
      if (selection.map(({ _id }) => _id).indexOf(playingAlbumID) > -1) {
        dispatch(showDialog('Album in play', 'Album is currently in playback!'));
        return;
      }
      const confirmed = await confirmDialog({
        title: 'Playlist Delete',
        message: `You are about to delete ${selection.length} album(s) from your library, are you sure?`
      });
      if (confirmed) {
        dispatch(removeAlbums(selection));
      }
    }
  };
}

export const LIBRARY_CONTENT_CONTEXT_ACTIONS = 'playa/context-menu/library-content-actions';

export enum LibraryContentActions {
  REMOVE_ALBUM = 'REMOVE_ALBUM'
}

export function mapAction(actionID: LibraryContentActions): ActionCreator {
  switch (actionID) {
    case LibraryContentActions.REMOVE_ALBUM:
      return removeAlbumsAction;
  }
}

export enum LibraryContentActionGroups {
  ALBUMS
}

export type GetLibraryContentContextMenuParams = {
  type: typeof LIBRARY_CONTENT_CONTEXT_ACTIONS;
  actionGroups?: LibraryContentActionGroups[];
  playingAlbumID?: Album['_id'];
  selection?: Album[];
  dispatch?: Function;
}

const actionGroupsMap = {
  [LibraryContentActionGroups.ALBUMS]: [LibraryContentActions.REMOVE_ALBUM],
};

export function getActionGroups({
  actionGroups = [LibraryContentActionGroups.ALBUMS],
  selection,
  playingAlbumID,
  dispatch
}: GetLibraryContentContextMenuParams): MenuItemConstructorOptions[] {
  return actionGroups.reduce((memo, group, index, original) => [
    ...memo,
    ...actionGroupsMap[group]
      .map(mapAction)
      .map(action => {
        const { title, handler } = action({ selection, playingAlbumID, dispatch });
        return { label: title, click: handler };
      }),
    ...index < original.length ? [{ type : 'separator'}] : []
  ], []);
}
