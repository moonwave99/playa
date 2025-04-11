import {
  getGroup,
  getAllGroups,
  getGroups,
  createGroup,
  updateGroup,
  addArtistsToGroup,
  removeArtistsFromGroup,
  deleteGroup,
  deleteGroups,
  setGroupCoverArtist
} from '../db/group';

export function groupController() {
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
    setGroupCoverArtist
  };
}

export const actions = [
  'getGroup',
  'getAllGroups',
  'getGroups',
  'createGroup',
  'updateGroup',
  'addArtistsToGroup',
  'removeArtistsFromGroup',
  'deleteGroup',
  'deleteGroups',
  'setGroupCoverArtist'
];