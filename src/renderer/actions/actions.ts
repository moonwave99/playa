import { ActionCreator } from './actionUtils';

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
