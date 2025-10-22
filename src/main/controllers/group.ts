import {
  getGroup,
  getAllGroups,
  getGroups,
  createGroup,
  updateGroup as _updateGroup,
  addArtistsToGroup,
  addArtistsToNewGroup,
  removeArtistsFromGroup as _removeArtistsFromGroup,
  deleteGroup,
  deleteGroups,
  setGroupCoverArtist,
} from "../db/group";

type GroupControllerParams = {
  send: (channel: string, ...args: unknown[]) => void;
  openConfirmDialog: (message: string, detail: string) => boolean;
};

export function groupController({
  send,
  openConfirmDialog,
}: GroupControllerParams) {
  async function removeArtistsFromGroup(id: number, artist_ids: number[]) {
    const confirm = openConfirmDialog(
      `Are you sure to remove ${artist_ids.length} entries from this Group?`,
      ""
    );

    if (!confirm) {
      return;
    }

    return await _removeArtistsFromGroup(id, artist_ids);
  }

  async function updateGroup(...params: Parameters<typeof _updateGroup>) {
    const updatedGroup = await _updateGroup(...params);
    if (updatedGroup) {
      send("notify", {
        type: "success",
        message: "Group updated",
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
