import { MenuItemConstructorOptions } from 'electron';

import {
  AlbumActions,
  AlbumActionsMap,
  ActionParams as AlbumActionParams
} from './albumActions';

import {
  LibraryContentActions,
  LibraryContentActionsMap,
  ActionParams as LibraryActionParams
} from './libraryContentActions';

import {
  PlaylistContentActions,
  PlaylistContentActionsMap,
  ActionParams as PlaylistContentActionParams
} from './playlistContentActions';

import {
  PlaylistListActions,
  PlaylistListActionsMap,
  ActionParams as PlaylistListActionParams
} from './playlistListActions';

export type Action = {
  title: string;
  handler: Function;
}

export type ActionCreator<T> = (actionParams: T) => Action;

export type ActionMap<T> = {
  [key: string]: ActionCreator<T>;
}

export type ActionGroupsMap = {
  [key: string]: string[];
}

export type AllActions =
    AlbumActions
  | LibraryContentActions
  | PlaylistContentActions
  | PlaylistListActions;

type AllParams =
    AlbumActionParams
  | LibraryActionParams
  | PlaylistContentActionParams
  | PlaylistListActionParams;

const megaMap: { [key: string]: ActionCreator<AllParams> } =
  [
    AlbumActionsMap,
    LibraryContentActionsMap,
    PlaylistContentActionsMap,
    PlaylistListActionsMap
  ].reduce((memo, map) => ({ ...memo, ...map}), {});

export default function actionsMap(action: AllActions): ActionCreator<AllParams> {
  return megaMap[action];
}

export function grouper<T>({
  actionGroups,
  actionParams,
  actionGroupsMap,
  actionsMap
}: {
  actionGroups: string[];
  actionParams: T;
  actionGroupsMap: ActionGroupsMap;
  actionsMap: ActionMap<T>;
}): MenuItemConstructorOptions[] {
  return actionGroups.reduce((memo, group, index, original) => [
    ...memo,
    ...actionGroupsMap[group]
      .map(actionID => actionsMap[actionID])
      .map(action => {
        const { title, handler } = action(actionParams);
        return { label: title, click: handler };
      }),
    ...index < original.length - 1 ? [{ type : 'separator'}] : []
  ], []);
}
