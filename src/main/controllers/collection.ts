import { difference } from "lodash";
import {
  getCollections,
  getAllCollections,
  getCollection,
  createCollection,
  updateCollection,
  addReleasesToCollection,
  addReleasesToNewCollection,
  removeReleasesFromCollection as _removeReleasesFromCollection,
  deleteCollection as _deleteCollection,
  deleteCollections as _deleteCollections,
  setCollectionCoverRelease,
} from "../db/collection";
import { type StateManager } from "../stateManager";
import { withConfirmDialog, withNotification } from "../utils";
import { OpenConfirmDialog, Send } from "@/types/types";

type CollectionControllerParams = {
  send: Send;
  openConfirmDialog: OpenConfirmDialog;
  stateManager: StateManager;
};

export function collectionController({
  send,
  openConfirmDialog,
  stateManager,
}: CollectionControllerParams) {
  async function deleteCollection(id: number) {
    const confirm = await withConfirmDialog(openConfirmDialog)(
      _deleteCollection,
      {
        message: "Delete Collection",
        detail:
          "Are you sure you want to remove the selected Collection from your Library?",
      }
    )(id);

    if (!confirm) {
      return;
    }

    send("mutate", [
      ["collections", "latest"],
      ["collections", id],
    ]);

    send("notify", {
      type: "success",
      message: "Collection deleted from Library",
    });

    stateManager.setSelection("collection", (currentSelection) =>
      difference(currentSelection, [id])
    );
  }

  async function deleteCollections(collection_ids: number[]) {
    const result = await withConfirmDialog(openConfirmDialog)(
      _deleteCollections,
      {
        message: "Delete Collection",
        detail: `Are you sure you want to remove ${collection_ids.length} Collections from your Library?`,
      }
    )(collection_ids);

    if (!result) {
      return;
    }

    send("mutate", [
      ["collections", "latest"],
      ...collection_ids.map((id) => ["collections", id]),
    ]);

    send("notify", {
      type: "success",
      message: `${collection_ids.length} Collection deleted from Library`,
    });

    stateManager.setSelection("collection", (currentSelection) =>
      difference(currentSelection, collection_ids)
    );
  }

  async function removeReleasesFromCollection(
    id: number,
    release_ids: number[]
  ) {
    const confirm = await withConfirmDialog(openConfirmDialog)(
      _removeReleasesFromCollection,
      (_, release_ids: number[]) => ({
        message: "Update Collection",
        detail: `Are you sure you want to remove ${release_ids.length} Releases from this Collection?`,
      })
    )(id, release_ids);

    if (!confirm) {
      return;
    }

    send("mutate", [
      ["collections", "latest"],
      ["collections", id],
    ]);

    send("notify", {
      type: "success",
      message: `${release_ids.length} Releases removed from Collection`,
    });

    stateManager.setSelection("release", (currentSelection) =>
      difference(currentSelection, release_ids)
    );

    return confirm;
  }

  return {
    getCollections,
    getAllCollections,
    getCollection,
    createCollection,
    updateCollection: withNotification(send)(updateCollection, {
      type: "success",
      message: "Collection updated",
    }) as typeof updateCollection,
    deleteCollection,
    deleteCollections,
    addReleasesToCollection: withNotification(send)(addReleasesToCollection, {
      type: "success",
      message: "Releases added to Collection",
    }) as typeof addReleasesToCollection,
    addReleasesToNewCollection,
    removeReleasesFromCollection,
    setCollectionCoverRelease,
  };
}

export const actions: (keyof ReturnType<typeof collectionController>)[] = [
  "getCollections",
  "getAllCollections",
  "getCollection",
  "createCollection",
  "updateCollection",
  "addReleasesToCollection",
  "addReleasesToNewCollection",
  "removeReleasesFromCollection",
  "deleteCollections",
  "setCollectionCoverRelease",
];
