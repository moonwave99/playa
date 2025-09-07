import { existsSync, move } from "fs-extra";
import { dialog } from "electron";
import { Artist } from "@/types/types";
import {
  getArtist,
  getAllArtists,
  getLatestArtists,
  updateArtist,
  setArtistCoverRelease,
  searchArtists,
  addRelatedArtist,
  removeRelatedArtist,
} from "../db/artist";
import { StateManager } from "../state";

type ArtistControllerParams = {
  withPath: (key: string, folderPath: string) => string;
  state: StateManager;
};

type EditArtistParams = Pick<Artist, "path" | "id"> & {
  newPath: string;
  newName: string;
};

export function artistController({ withPath, state }: ArtistControllerParams) {
  async function editArtist(infos: EditArtistParams) {
    const shouldMoveArtist = infos.newPath !== infos.path;
    if (
      shouldMoveArtist &&
      existsSync(withPath("LIBRARY_PATH", infos.newPath))
    ) {
      dialog.showMessageBoxSync(null, {
        message: "Error while renaming",
        detail: `Path ${infos.newPath} already exists`,
        type: "error",
        buttons: ["OK"],
      });
      return false;
    }

    if (shouldMoveArtist) {
      await move(
        withPath("LIBRARY_PATH", infos.path),
        withPath("LIBRARY_PATH", infos.newPath)
      );
    }

    const updatedArtist = await updateArtist(infos.id, {
      name: infos.newName,
      path: infos.newPath,
    });

    state.setCurrentArtist(updatedArtist);

    return updatedArtist;
  }

  return {
    getArtist,
    getAllArtists,
    getLatestArtists,
    updateArtist,
    editArtist,
    setArtistCoverRelease,
    searchArtists,
    addRelatedArtist,
    removeRelatedArtist,
  };
}

export const actions = [
  "getArtist",
  "getAllArtists",
  "getLatestArtists",
  "updateArtist",
  "editArtist",
  "setArtistCoverRelease",
  "searchArtists",
  "addRelatedArtist",
  "removeRelatedArtist",
];
