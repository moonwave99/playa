import {
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
} from '../db/collection';

export function collectionController() {
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