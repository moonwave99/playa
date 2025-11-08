import { existsSync, move, unlink } from "fs-extra";
import prisma from "../db/prisma";
import { DOWNLOAD_COVERS_THROTTLE_INTERVAL } from "@/constants";
import {
  EditReleaseParam,
  ReleaseWithArtist,
  Release,
  Track,
  HasEntityTypeAndId,
  ShowErrorBox,
  OpenConfirmDialog,
  Send,
  OpenFolderDialog,
  WithTracks,
} from "@/types/types";
import { mapSeries } from "@/lib/utils";
import {
  getReleaseTitleInfo,
  getRelease,
  getReleases,
  getSelectedReleases,
  getLatestAdditions,
  updateReleases,
  unGroupRelease,
  deleteReleases as _deleteReleases,
  addTracksToRelease,
  toggleHomepageVisibility,
  addNewAdditionalArtist as _addNewAdditionalArtist,
  addAdditionalArtist as _addAdditionalArtist,
  removeAdditionalArtist as _removeAdditionalArtist,
  groupReleases as _groupReleases,
  type GroupReleaseParams,
} from "../db/release";

import {
  checkReleaseContentsMatch,
  stripPath,
  withConfirmDialog,
} from "../utils";
import { hashRelease } from "../hash";
import { searchCover, getImageFromURL, updateCoverInfo } from "../covers";
import { log } from "../logger";
import { type StateManager } from "../stateManager";
import type { GetSetting } from "./settings";

type ReleaseControllerParams = {
  withPath: (key: string, folderPath: string) => string;
  getSetting: GetSetting;
  send: Send;
  showErrorBox: ShowErrorBox;
  openConfirmDialog: OpenConfirmDialog;
  openFolderDialog: OpenFolderDialog;
  stateManager: StateManager;
};

export function releaseController({
  withPath,
  getSetting,
  send,
  stateManager,
  showErrorBox,
  openConfirmDialog,
  openFolderDialog,
}: ReleaseControllerParams) {
  async function editRelease(infos: EditReleaseParam[]) {
    if (!infos.length) {
      return [];
    }

    try {
      const newInfos = infos.map((x) => ({
        ...x,
        hash: hashRelease({
          ...x,
          type: x.newType,
          year: x.newYear,
        }),
        discTitle: infos.length === 1 ? null : x.newDiscTitle,
        title: x.newTitle,
        type: x.newType,
        year: x.newYear,
      }));

      await Promise.all(
        infos.map(async (x, index) => {
          const oldCoverPath = withPath("COVERS_PATH", `${x.hash}-cover.jpg`);
          const newCoverPath = withPath(
            "COVERS_PATH",
            `${newInfos[index].hash}-cover.jpg`
          );

          if (!existsSync(oldCoverPath) || oldCoverPath === newCoverPath) {
            return true;
          }

          await move(oldCoverPath, newCoverPath);

          return true;
        })
      );

      return await updateReleases(newInfos);
    } catch (error) {
      log("release:renameRelease", error);
      log("release:renameRelease", infos);
      showErrorBox("Error while renaming", error.message);
      return false;
    }
  }

  async function downloadCover({ id, url }: { id: number; url: string }) {
    const release = await prisma.release.findFirst({
      where: { id },
      include: { artist: true },
    });

    if (!release) {
      return false;
    }

    const COVERS_PATH = getSetting("COVERS_PATH") as string;

    const imagePath = await getImageFromURL({
      outputPath: COVERS_PATH,
      hash: release.hash,
      url,
    });

    if (imagePath) {
      await updateCoverInfo(id, imagePath);
      send("mutate", [["releases", id]]);
      send("coverUpdate", [release]);
    }

    return !!imagePath;
  }

  async function importCovers(
    releases: (ReleaseWithArtist & { tracks?: Track[] })[]
  ) {
    const COVERS_PATH = getSetting("COVERS_PATH") as string;
    const DISCOGS_KEY = getSetting("DISCOGS_KEY") as string;
    const DISCOGS_SECRET = getSetting("DISCOGS_SECRET") as string;

    await mapSeries(
      releases,
      async (release: ReleaseWithArtist & { tracks?: Track[] }) => {
        const pic = await searchCover(
          {
            release,
            artist: release.artist,
            track: release.tracks?.length > 0 ? release.tracks[0] : null,
            outputPath: COVERS_PATH,
          },
          {
            DISCOGS_KEY,
            DISCOGS_SECRET,
          }
        );
        if (!pic) {
          return null;
        }
        send("mutate", [["releases", release.id]]);
        send("coverUpdate", [release]);
        return pic;
      },
      DOWNLOAD_COVERS_THROTTLE_INTERVAL
    );
  }

  async function importMissingCovers(releases: ReleaseWithArtist[]) {
    const releasesWithoutCover = releases.filter(
      ({ hash }) => !existsSync(withPath("COVERS_PATH", `${hash}-cover.jpg`))
    );
    await importCovers(releasesWithoutCover);
  }

  async function deleteCover(release: Pick<Release, "id" | "hash">) {
    const cover = withPath("COVERS_PATH", `${release.hash}-cover.jpg`);
    await unlink(cover);
    await prisma.release.update({
      where: { id: release.id },
      data: {
        colorInfo: null,
      },
    });
    send("mutate", [["releases", release.id]]);
    send("coverUpdate", [release]);
    return true;
  }

  async function unGroupSelectedRelease() {
    const releases = await getSelectedReleases(
      stateManager.getSelection("release")
    );
    if (!releases.at(0)) {
      return;
    }
    const release = releases.at(0) as Release & { subReleases: Release[] };
    await unGroupRelease(release);
    send("mutate", [
      ["releases", "latest"],
      ["artists", release.artist_id],
    ]);
    send("clearSelection");
    send("notify", { type: "success", message: "releases unGrouped" });
  }

  async function deleteReleases(
    release_ids: number[],
    context?: HasEntityTypeAndId
  ) {
    const confirm = await withConfirmDialog(openConfirmDialog)(
      _deleteReleases,
      {
        message: `Are you sure to delete ${release_ids.length} Releases from library?`,
        detail: "This action is not reversible!",
      }
    )(release_ids);

    if (!confirm) {
      return false;
    }

    send(
      "mutate",
      [
        ["releases", "latest"],
        ...release_ids.map((id) => ["releases", id]),
        context ? [`${context.entityType}s`, context.id] : null,
      ].filter((x) => !!x)
    );

    send("clearSelection");

    send("notify", {
      type: "success",
      message: `${release_ids.length} releases deleted`,
    });
  }

  async function addAdditionalArtist(
    ...params: Parameters<typeof _addAdditionalArtist>
  ) {
    const updatedRelease = await _addAdditionalArtist(...params);
    if (updatedRelease) {
      send("mutate", [
        ["releases", params[0].release_id],
        ["artists", updatedRelease.artist.id],
        ["artists", params[0].artist_id],
      ]);
    }
    return updatedRelease;
  }

  async function removeAdditionalArtist(
    ...params: Parameters<typeof _addAdditionalArtist>
  ) {
    const result = await _removeAdditionalArtist(...params);
    send("mutate", [
      ["releases", params[0].release_id],
      ["artists", result.artist.id],
      ["artists", params[0].artist_id],
    ]);
    return result;
  }

  async function addNewAdditionalArtist(
    ...params: Parameters<typeof _addNewAdditionalArtist>
  ) {
    const updatedRelease = await _addNewAdditionalArtist(...params);
    if (updatedRelease) {
      send("mutate", [
        ["releases", "latest"],
        ["releases", params[0].release_id],
        ["artists", updatedRelease.artist.id],
      ]);
    }
    return updatedRelease;
  }

  async function groupReleases(params: GroupReleaseParams) {
    const { updatedArtists } = await _groupReleases(params);
    send("mutate", [
      ["releases", "latest"],
      ...updatedArtists.map((id: number) => ["artists", id]),
    ]);
    send("clearSelection");
    send("notify", {
      type: "success",
      message: `${params.discInfo.length} releases grouped`,
    });
  }

  async function hideRelease(id: number) {
    await toggleHomepageVisibility(id);
    send("mutate", [["releases", "latest"]]);
  }

  async function showRelease(id: number) {
    await toggleHomepageVisibility(id, false);
    send("mutate", [["releases", "latest"]]);
  }

  type RelocateReleaseParams = { warnOnContentDifference?: boolean };

  async function relocateRelease(
    id: number,
    { warnOnContentDifference }: RelocateReleaseParams = {
      warnOnContentDifference: true,
    }
  ) {
    const LIBRARY_PATH = getSetting("LIBRARY_PATH") as string;
    const dialogResult = openFolderDialog({
      key: "openRelocateReleaseFolder",
      defaultPath: LIBRARY_PATH,
      properties: ["openDirectory"],
    });

    if (!dialogResult) {
      return false;
    }

    const newFolder = dialogResult.at(0);
    const release = (await getRelease(id)) as Release & WithTracks;

    const { newContents, status } = await checkReleaseContentsMatch({
      release,
      newFolder,
      warnOnContentDifference,
    });

    if (status === "EMPTY_FOLDER") {
      showErrorBox(
        "Error relocating Release folder",
        "No tracks were found in the selected folder"
      );
      return false;
    }

    if (status === "CONTENT_MISMATCH") {
      showErrorBox(
        "Error relocating Release folder",
        "The contents of the selected folder do not match current Release contents."
      );
      return false;
    }
    try {
      await prisma.release.update({
        where: { id },
        data: {
          path: stripPath(newFolder, LIBRARY_PATH),
        },
      });
      await addTracksToRelease(id, newContents);

      send("mutate", [["releases", id]]);
      send("clearSelection");
      send("notify", {
        type: "success",
        message: "Release relocated",
      });
      return true;
    } catch (error) {
      log("release:relocateRelease", error);
      log("release:relocateRelease", newFolder);
      showErrorBox("Error relocating Release folder", error.message);
      return false;
    }
  }

  return {
    getReleaseTitleInfo,
    getRelease,
    getReleases,
    getSelectedReleases,
    getLatestAdditions,
    groupReleases,
    unGroupRelease,
    editRelease,
    deleteReleases,
    addTracksToRelease,
    downloadCover,
    importCovers,
    importMissingCovers,
    deleteCover,
    unGroupSelectedRelease,
    hideRelease,
    showRelease,
    addAdditionalArtist,
    removeAdditionalArtist,
    addNewAdditionalArtist,
    relocateRelease,
  };
}

export const actions: (keyof ReturnType<typeof releaseController>)[] = [
  "getRelease",
  "getReleases",
  "getLatestAdditions",
  "groupReleases",
  "unGroupRelease",
  "editRelease",
  "deleteReleases",
  "addTracksToRelease",
  "downloadCover",
  "importCovers",
  "importMissingCovers",
  "deleteCover",
  "unGroupSelectedRelease",
  "hideRelease",
  "showRelease",
  "addAdditionalArtist",
  "removeAdditionalArtist",
  "addNewAdditionalArtist",
  "relocateRelease",
];
