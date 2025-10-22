import {
  getCollections,
  getAllCollections,
  getCollection,
  createCollection,
  updateCollection as _updateCollection,
  addReleasesToCollection,
  addReleasesToNewCollection,
  removeReleasesFromCollection as _removeReleasesFromCollection,
  deleteCollections,
  deleteCollection,
  setCollectionCoverRelease,
} from "../db/collection";

import { withConfirmDialog, withNotification } from "../utils";

type CollectionControllerParams = {
  send: (channel: string, ...args: unknown[]) => void;
  openConfirmDialog: (message: string, detail: string) => boolean;
};

export function collectionController({
  send,
  openConfirmDialog,
}: CollectionControllerParams) {
  const removeReleasesFromCollection = withConfirmDialog(openConfirmDialog)(
    _removeReleasesFromCollection,
    (_, artist_ids: number[]) => ({
      message: "Update Collection",
      detail: `Are you sure you want to remove ${artist_ids.length} entries from this Group?`,
    })
  ) as typeof _removeReleasesFromCollection;

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
    addReleasesToCollection,
    addReleasesToNewCollection,
    removeReleasesFromCollection,
    deleteCollections,
    deleteCollection,
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
  "deleteCollection",
  "setCollectionCoverRelease",
];
