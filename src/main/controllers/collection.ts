import {
  getCollections,
  getAllCollections,
  getCollection,
  createCollection,
  updateCollection,
  addReleasesToCollection,
  removeReleasesFromCollection as _removeReleasesFromCollection,
  deleteCollections,
  deleteCollection,
  setCollectionCoverRelease
} from '../db/collection';

import { dialog } from 'electron';

export function collectionController() {
  async function removeReleasesFromCollection(id: number, release_ids: number[]) {
    const cancel = dialog.showMessageBoxSync(null, {
      message: `Are you sure to remove ${release_ids.length} entries from this Collection?`,
      type: 'warning',
      buttons: ['OK', 'Cancel'],
      defaultId: 1,
    });

    if (cancel) {
      return;
    }

    return await _removeReleasesFromCollection(id, release_ids);
  }

  return {
    getCollections,
    getAllCollections,
    getCollection,
    createCollection,
    updateCollection,
    addReleasesToCollection,
    removeReleasesFromCollection,
    deleteCollections,
    deleteCollection,
    setCollectionCoverRelease
  };
}

export const actions = [
  'getCollections',
  'getAllCollections',
  'getCollection',
  'createCollection',
  'updateCollection',
  'addReleasesToCollection',
  'removeReleasesFromCollection',
  'deleteCollections',
  'deleteCollection',
  'setCollectionCoverRelease'
];