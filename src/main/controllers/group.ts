import {
  getGroup,
  getAllGroups,
  getGroups,
  createGroup,
  updateGroup as _updateGroup,
  addArtistsToGroup,
  removeArtistsFromGroup as _removeArtistsFromGroup,
  deleteGroup,
  deleteGroups,
  setGroupCoverArtist,
} from "../db/group";

import { dialog } from "electron";

type GroupControllerParams = {
  send: (channel: string, ...args: unknown[]) => void;
};

export function groupController({ send }: GroupControllerParams) {
  async function removeArtistsFromGroup(id: number, artist_ids: number[]) {
    const cancel = dialog.showMessageBoxSync(null, {
      message: `Are you sure to remove ${artist_ids.length} entries from this Group?`,
      type: "warning",
      buttons: ["OK", "Cancel"],
      defaultId: 1,
    });

    if (cancel) {
      return;
    }

    return await _removeArtistsFromGroup(id, artist_ids);
  }

  async function updateGroup(...params: Parameters<typeof _updateGroup>) {
    const updatedGroup = await _updateGroup(...params);
    if (updatedGroup) {
      send("notify", {
        type: "success",
        message: "Group renamed",
      });
    }
    return updatedGroup;
  }

  return {
    getGroup,
    getAllGroups,
    getGroups,
    createGroup,
    updateGroup,
    addArtistsToGroup,
    removeArtistsFromGroup,
    deleteGroup,
    deleteGroups,
    setGroupCoverArtist,
  };
}

export const actions = [
  "getGroup",
  "getAllGroups",
  "getGroups",
  "createGroup",
  "updateGroup",
  "addArtistsToGroup",
  "removeArtistsFromGroup",
  "deleteGroup",
  "deleteGroups",
  "setGroupCoverArtist",
];
