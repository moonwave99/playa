import { difference } from "lodash";
import {
  getGroup,
  getAllGroups,
  getGroupAlphabeticalList,
  getGroups,
  createGroup,
  updateGroup as _updateGroup,
  addArtistsToGroup as _addArtistsToGroup,
  addArtistsToNewGroup as _addArtistsToNewGroup,
  removeArtistsFromGroup as _removeArtistsFromGroup,
  deleteGroup as _deleteGroup,
  deleteGroups as _deleteGroups,
  setGroupCoverArtist,
} from "../db/group";
import { type StateManager } from "../stateManager";
import { withConfirmDialog, withNotification } from "../utils";
import { OpenConfirmDialog, Send } from "@/types/types";

type GroupControllerParams = {
  send: Send;
  openConfirmDialog: OpenConfirmDialog;
  stateManager: StateManager;
};

export function groupController({
  send,
  openConfirmDialog,
  stateManager,
}: GroupControllerParams) {
  async function deleteGroup(id: number) {
    const confirm = await withConfirmDialog(openConfirmDialog)(_deleteGroup, {
      message: "Delete Group",
      detail: `Are you sure you want to remove this Group from your Library?`,
    })(id);

    if (!confirm) {
      return false;
    }

    send("mutate", [
      ["group", "latest"],
      ["group", id],
    ]);

    send("notify", {
      type: "success",
      message: "Group deleted from Library",
    });

    stateManager.setSelection("collection", (currentSelection) =>
      difference(currentSelection, [id])
    );
  }

  async function deleteGroups(group_ids: number[]) {
    const confirm = await withConfirmDialog(openConfirmDialog)(_deleteGroups, {
      message: "Delete Group",
      detail: `Are you sure you want to remove the selected Groups from your Library?`,
    })(group_ids);

    if (!confirm) {
      return false;
    }

    send("mutate", [
      ["groups", "latest"],
      ...group_ids.map((id) => ["groups", id]),
    ]);

    send("notify", {
      type: "success",
      message: `${group_ids.length} Groups deleted from Library`,
    });

    stateManager.setSelection("group", (currentSelection) =>
      difference(currentSelection, group_ids)
    );
  }

  async function removeArtistsFromGroup(id: number, artist_ids: number[]) {
    const confirm = await withConfirmDialog(openConfirmDialog)(
      _removeArtistsFromGroup,
      (_, artist_ids: number[]) => ({
        message: "Update Group",
        detail: `Are you sure to want to remove ${artist_ids.length} Artists from this Group?`,
      })
    )(id, artist_ids);

    if (!confirm) {
      return false;
    }

    send("mutate", [
      ["groups", "latest"],
      ["groups", id],
    ]);

    send("notify", {
      type: "success",
      message: `${artist_ids.length} Artists removes from Group`,
    });

    stateManager.setSelection("artist", (currentSelection) =>
      difference(currentSelection, artist_ids)
    );

    return confirm;
  }

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
    getGroupAlphabeticalList,
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
  "getGroupAlphabeticalList",
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
