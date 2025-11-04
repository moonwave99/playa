import { Artist, Send, OpenConfirmDialog, ShowErrorBox } from "@/types/types";
import {
  getArtist,
  getArtistAlphabeticalList,
  getLatestArtists,
  getSelectedArtist,
  getSelectedArtists,
  updateArtist,
  setArtistCoverRelease as _setArtistCoverRelease,
  searchArtists,
  addRelatedArtist as _addRelatedArtist,
  removeRelatedArtist as _removeRelatedArtist,
  deleteArtist as _deleteArtist,
  deleteArtists as _deleteArtists,
} from "../db/artist";
import { withConfirmDialog } from "../utils";
import { StateManager } from "../stateManager";
import { difference } from "lodash";

type ArtistControllerParams = {
  send: Send;
  showErrorBox: ShowErrorBox;
  openConfirmDialog: OpenConfirmDialog;
  stateManager: StateManager;
};

type EditArtistParams = Pick<Artist, "id"> & {
  newName: string;
};

export function artistController({
  send,
  openConfirmDialog,
  stateManager,
}: ArtistControllerParams) {
  async function editArtist(infos: EditArtistParams) {
    const updatedArtist = await updateArtist(infos.id, {
      name: infos.newName,
    });

    send("mutate", [
      ["artists", "latest"],
      ["artists", infos.id],
    ]);

    send("notify", {
      type: "success",
      message: "Artist renamed",
    });

    return updatedArtist;
  }

  async function deleteArtist(id: number) {
    const confirm = await withConfirmDialog(openConfirmDialog)(_deleteArtist, {
      message: "Delete Artist",
      detail:
        "Are you sure you want to remove the selected Artist and all their Releases from your Library?",
    })(id);

    if (!confirm) {
      return false;
    }

    send("mutate", [
      ["releases", "latest"],
      ["artists", "latest"],
      ["artists", id],
    ]);

    send("notify", {
      type: "success",
      message: "Artist deleted",
    });

    stateManager.setSelection("artist", (currentSelection) =>
      difference(currentSelection, [id])
    );
  }

  async function deleteArtists(artist_ids: number[]) {
    const confirm = await withConfirmDialog(openConfirmDialog)(_deleteArtists, {
      message: "Delete Artists",
      detail: `Are you sure you want to remove ${artist_ids.length} Artist and all their Releases from your Library?`,
    })(artist_ids);

    if (!confirm) {
      return false;
    }

    send("mutate", [
      ["releases", "latest"],
      ["artists", "latest"],
      ...artist_ids.map((id) => ["artists", id]),
    ]);

    send("notify", {
      type: "success",
      message: "Artists deleted",
    });

    stateManager.setSelection("artist", (currentSelection) =>
      difference(currentSelection, artist_ids)
    );
  }

  async function setArtistCoverRelease(artist_id: number, release_id: number) {
    const result = await _setArtistCoverRelease(artist_id, release_id);
    if (!result) {
      return;
    }
    send("mutate", [
      ["artists", "latest"],
      ["artists", artist_id],
    ]);
  }

  async function addRelatedArtist(
    ...params: Parameters<typeof _addRelatedArtist>
  ) {
    const result = await _addRelatedArtist(...params);
    send("mutate", [
      ["artists", params[0]],
      ["artists", params[1]],
    ]);
    return result;
  }

  async function removeRelatedArtist(
    ...params: Parameters<typeof _removeRelatedArtist>
  ) {
    const result = await _removeRelatedArtist(...params);
    send("mutate", [
      ["artists", params[0]],
      ["artists", params[1]],
    ]);
    return result;
  }

  return {
    getArtist,
    getArtistAlphabeticalList,
    getSelectedArtist,
    getSelectedArtists,
    getLatestArtists,
    updateArtist,
    editArtist,
    setArtistCoverRelease,
    searchArtists,
    addRelatedArtist,
    removeRelatedArtist,
    deleteArtist,
    deleteArtists,
  };
}

export const actions: (keyof ReturnType<typeof artistController>)[] = [
  "getArtist",
  "getArtistAlphabeticalList",
  "getLatestArtists",
  "updateArtist",
  "editArtist",
  "setArtistCoverRelease",
  "searchArtists",
  "addRelatedArtist",
  "removeRelatedArtist",
  "deleteArtist",
];
