import { existsSync, move } from "fs-extra";
import { Artist } from "@/types/types";
import {
  getArtist,
  getAllArtists,
  getLatestArtists,
  getSelectedArtist,
  getSelectedArtists,
  updateArtist,
  setArtistCoverRelease,
  searchArtists,
  addRelatedArtist,
  removeRelatedArtist,
  deleteArtist as _deleteArtist,
} from "../db/artist";
import prisma from "../db/prisma";
import { getEntityPath } from "../utils";

type ArtistControllerParams = {
  withPath: (key: string, folderPath: string) => string;
  send: (channel: string, ...args: unknown[]) => void;
  showErrorBox: (title: string, content: string) => void;
  openConfirmDialog: (message: string, detail: string) => boolean;
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
    const confirm = openConfirmDialog(
      "Delete Artist",
      "Are you sure you want to remove the selected Artist and all their Releases from your Library?"
    );
    if (!confirm) {
      return;
    }

    await _deleteArtist(id);

    send("mutate", [
      ["releases", "latest"],
      ["artists", "latest"],
      ["artists", id],
    ]);

    send("notify", {
      type: "success",
      message: "Artist deleted",
    });
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
