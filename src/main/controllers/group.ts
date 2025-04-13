import {
  getGroup,
  getAllGroups,
  getGroups,
  createGroup,
  updateGroup,
  addArtistsToGroup,
  removeArtistsFromGroup as _removeArtistsFromGroup,
  deleteGroup,
  deleteGroups,
  setGroupCoverArtist
} from '../db/group';

import { dialog } from 'electron';

export function groupController() {
  async function removeArtistsFromGroup(id: number, artist_ids: number[]) {
    const cancel = dialog.showMessageBoxSync(null, {
      message: `Are you sure to remove ${artist_ids.length} entries from this Group?`,
      type: 'warning',
      buttons: ['OK', 'Cancel'],
      defaultId: 1,
    });

    if (cancel) {
      return;
    }

    return await _removeArtistsFromGroup(id, artist_ids);
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