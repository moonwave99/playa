import { existsSync, move } from "fs-extra";
import { Artist } from "@/types/types";
import {
  getArtist,
  getAllArtists,
  getLatestArtists,
  getSelectedArtist,
  getSelectedArtists,
  updateArtist,
  setArtistCoverRelease as _setArtistCoverRelease,
  searchArtists,
  addRelatedArtist,
  removeRelatedArtist,
  deleteArtist as _deleteArtist,
  deleteArtists as _deleteArtists,
} from "../db/artist";
import prisma from "../db/prisma";
import { getEntityPath, withConfirmDialog } from "../utils";
import { StateManager } from "../stateManager";
import { difference } from "lodash";

type ArtistControllerParams = {
  withPath: (key: string, folderPath: string) => string;
  send: (channel: string, ...args: unknown[]) => void;
  showErrorBox: (title: string, content: string) => void;
  openConfirmDialog: (message: string, detail: string) => boolean;
  stateManager: StateManager;
  skipMove?: boolean;
};

type EditArtistParams = Pick<Artist, "path" | "id"> & {
  newPath: string;
  newName: string;
};

export function artistController({
  withPath,
  send,
  showErrorBox,
  openConfirmDialog,
  stateManager,
  skipMove = false,
}: ArtistControllerParams) {
  async function editArtist(infos: EditArtistParams) {
    const shouldMoveArtist = !skipMove && infos.newPath !== infos.path;

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

    const artist = await getArtist(infos.id);

    await Promise.all(
      artist.releases // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ completePath, ...release }) =>
          prisma.release.update({
            where: {
              id: release.id,
            },
            data: {
              completePath: getEntityPath(release),
            },
          })
        )
    );

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

  return {
    getArtist,
    getAllArtists,
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
  "getAllArtists",
  "getLatestArtists",
  "updateArtist",
  "editArtist",
  "setArtistCoverRelease",
  "searchArtists",
  "addRelatedArtist",
  "removeRelatedArtist",
  "deleteArtist",
];
