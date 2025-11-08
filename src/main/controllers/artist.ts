import path from "node:path";
import prisma from "../db/prisma";
import { pathExists } from "fs-extra";
import { difference } from "lodash";
import {
  Artist,
  Send,
  OpenConfirmDialog,
  ShowErrorBox,
  OpenFolderDialog,
} from "@/types/types";
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
import { addTracksToRelease } from "../db/release";
import {
  stripPath,
  withConfirmDialog,
  getCommonPathPrefix,
  checkReleaseContentsMatch,
} from "../utils";
import { StateManager } from "../stateManager";
import { GetSetting } from "./settings";
import { log } from "../logger";

type ArtistControllerParams = {
  getSetting: GetSetting;
  withPath: (key: string, folderPath: string) => string;
  send: Send;
  showErrorBox: ShowErrorBox;
  openConfirmDialog: OpenConfirmDialog;
  openFolderDialog: OpenFolderDialog;
  stateManager: StateManager;
};

type EditArtistParams = Pick<Artist, "id"> & {
  newName: string;
};

export function artistController({
  getSetting,
  withPath,
  showErrorBox,
  send,
  openConfirmDialog,
  openFolderDialog,
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

  async function checkArtistFolderContents(id: number) {
    const LIBRARY_PATH = getSetting("LIBRARY_PATH") as string;
    const artist = await getArtist(id);
    if (!artist.releases.length) {
      return false;
    }

    const existsMap = await Promise.all(
      artist.releases.map(async (x) => ({
        id: x.id,
        exists: await pathExists(withPath("LIBRARY_PATH", x.path)),
        absolutePath: path,
        path: stripPath(x.path, LIBRARY_PATH),
      }))
    );
    if (existsMap.some(({ exists }) => exists)) {
      return false;
    }

    const parentFolder = getCommonPathPrefix(existsMap.map((x) => x.path));
    return parentFolder || false;
  }

  type RelocateArtistFolderParams = {
    commonMissingPath: string;
    warnOnContentDifference?: boolean;
  };

  async function relocateArtistFolder(
    id: number,
    {
      commonMissingPath,
      warnOnContentDifference = true,
    }: RelocateArtistFolderParams
  ) {
    const LIBRARY_PATH = getSetting("LIBRARY_PATH") as string;
    const dialogResult = openFolderDialog({
      key: "openRelocateArtistFolder",
      defaultPath: LIBRARY_PATH,
      properties: ["openDirectory"],
    });

    if (!dialogResult) {
      return false;
    }

    const artist = await getArtist(id);
    const newCommonPath = stripPath(dialogResult.at(0), LIBRARY_PATH);

    const results = await Promise.all(
      artist.releases.map(async (release) => ({
        ...(await checkReleaseContentsMatch({
          release,
          newFolder: withPath(
            "LIBRARY_PATH",
            release.path.replace(commonMissingPath, newCommonPath)
          ),
          warnOnContentDifference,
        })),
        release,
      }))
    );

    if (results.some(({ status }) => status !== "CONTENT_MATCH")) {
      showErrorBox(
        "Error relocating Artist folder",
        "The selected folder contents do not match the missing Releases."
      );
      return false;
    }

    try {
      await Promise.all(
        results.map(async ({ release, newFolder, newContents }) => {
          await prisma.release.update({
            where: { id: release.id },
            data: {
              path: stripPath(newFolder, LIBRARY_PATH),
            },
          });
          await addTracksToRelease(release.id, newContents);
        })
      );

      send("mutate", [
        ["artists", id],
        ...results.map((x) => ["releases", x.release.id]),
      ]);
      send("notify", {
        type: "success",
        message: "Artist folder relocated",
      });
      return true;
    } catch (error) {
      log("artist:relocateArtistFolder", error);
      log("artist:relocateArtistFolder", results);
      showErrorBox("Error relocating Artist folder", error.message);
      return false;
    }
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
    checkArtistFolderContents,
    relocateArtistFolder,
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
  "checkArtistFolderContents",
  "relocateArtistFolder",
];
