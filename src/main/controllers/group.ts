import {
  getGroup,
  getAllGroups,
  getGroups,
  createGroup,
  updateGroup as _updateGroup,
  addArtistsToGroup as _addArtistsToGroup,
  addArtistsToNewGroup as _addArtistsToNewGroup,
  removeArtistsFromGroup as _removeArtistsFromGroup,
  deleteGroup,
  deleteGroups,
  setGroupCoverArtist,
} from "../db/group";

import { withConfirmDialog, withNotification } from "../utils";

type GroupControllerParams = {
  send: (channel: string, ...args: unknown[]) => void;
  openConfirmDialog: (message: string, detail: string) => boolean;
};

export function groupController({
  send,
  openConfirmDialog,
}: GroupControllerParams) {
  const removeArtistsFromGroup = withConfirmDialog(openConfirmDialog)(
    _removeArtistsFromGroup,
    (_, artist_ids: number[]) => ({
      message: "Update Group",
      detail: `Are you sure to want to remove ${artist_ids.length} entries from this Group?`,
    })
  ) as typeof _removeArtistsFromGroup;

  const updateGroup = withNotification(send)(_updateGroup, {
    type: "success",
    message: "Group updated",
  }) as typeof _updateGroup;

  const addArtistsToGroup = withNotification(send)(_addArtistsToGroup, {
    type: "success",
    message: "Artists added to Group",
  }) as typeof _addArtistsToGroup;

  const addArtistsToNewGroup = withNotification(send)(_addArtistsToNewGroup, {
    type: "success",
    message: "Artists added to Group",
  }) as typeof _addArtistsToNewGroup;

  return {
    getGroup,
    getAllGroups,
    getGroups,
    createGroup,
    updateGroup,
    addArtistsToGroup,
    addArtistsToNewGroup,
    removeArtistsFromGroup,
    deleteGroup,
    deleteGroups,
    setGroupCoverArtist,
  };
}

export const actions: (keyof ReturnType<typeof groupController>)[] = [
  "getGroup",
  "getAllGroups",
  "getGroups",
  "createGroup",
  "updateGroup",
  "addArtistsToGroup",
  "addArtistsToNewGroup",
  "removeArtistsFromGroup",
  "deleteGroup",
  "deleteGroups",
  "setGroupCoverArtist",
];
