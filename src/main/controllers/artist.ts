import { existsSync, move } from "fs-extra";
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
import { StateManager } from "../stateManager";

type ArtistControllerParams = {
  withPath: (key: string, folderPath: string) => string;
  send: (channel: string, ...args: unknown[]) => void;
  showErrorBox: (title: string, content: string) => void;
  stateManager: StateManager;
};

type EditArtistParams = Pick<Artist, "path" | "id"> & {
  newPath: string;
  newName: string;
};

export function artistController({
  withPath,
  send,
  showErrorBox,
  stateManager,
}: ArtistControllerParams) {
  async function editArtist(infos: EditArtistParams) {
    const shouldMoveArtist = infos.newPath !== infos.path;

    if (
      shouldMoveArtist &&
      existsSync(withPath("LIBRARY_PATH", infos.newPath))
    ) {
      showErrorBox(
        "Error while renaming",
        `Path ${infos.newPath} already exists`
      );
      return false;
    }

    if (shouldMoveArtist) {
      const targetPath = withPath("LIBRARY_PATH", infos.newPath);
      await move(withPath("LIBRARY_PATH", infos.path), targetPath);
      send("notify", {
        type: "info",
        message: `Artist folder moved to ${targetPath}`,
      });
    }

    const updatedArtist = await updateArtist(infos.id, {
      name: infos.newName,
      path: infos.newPath,
    });

    stateManager.setCurrentArtist({
      ...stateManager.getCurrentArtist(),
      ...(updatedArtist as Artist),
    });

    send("notify", {
      type: "success",
      message: `Artist renamed`,
    });

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

export const actions: (keyof ReturnType<typeof artistController>)[] = [
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
