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

import { dialog } from "electron";

type CollectionControllerParams = {
  send: (channel: string, ...args: unknown[]) => void;
};

export function collectionController({ send }: CollectionControllerParams) {
  async function removeReleasesFromCollection(
    id: number,
    release_ids: number[]
  ) {
    const cancel = dialog.showMessageBoxSync(null, {
      message: `Are you sure to remove ${release_ids.length} entries from this Collection?`,
      type: "warning",
      buttons: ["OK", "Cancel"],
      defaultId: 1,
    });

    if (cancel) {
      return;
    }

    return await _removeReleasesFromCollection(id, release_ids);
  }

  async function updateCollection(
    ...params: Parameters<typeof _updateCollection>
  ) {
    const updatedCollection = await _updateCollection(...params);
    if (updatedCollection) {
      send("notify", {
        type: "success",
        message: "Collection updated",
      });
    }
    return updatedCollection;
  }

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
