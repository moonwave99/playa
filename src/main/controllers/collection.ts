import { difference } from "lodash";
import {
  getCollections,
  getAllCollections,
  getCollection,
  createCollection,
  updateCollection as _updateCollection,
  addReleasesToCollection,
  addReleasesToNewCollection,
  removeReleasesFromCollection as _removeReleasesFromCollection,
  deleteCollection as _deleteCollection,
  deleteCollections as _deleteCollections,
  setCollectionCoverRelease,
} from "../db/collection";
import { type StateManager } from "../stateManager";
import { withConfirmDialog, withNotification } from "../utils";

type CollectionControllerParams = {
  send: (channel: string, ...args: unknown[]) => void;
  openConfirmDialog: (message: string, detail: string) => boolean;
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

  const updateCollection = withNotification(send)(_updateCollection, {
    type: "success",
    message: "Collection updated",
  }) as typeof _updateCollection;

  return {
    getCollections,
    getAllCollections,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    deleteCollections,
    addReleasesToCollection,
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
