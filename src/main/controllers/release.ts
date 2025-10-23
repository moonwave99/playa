import { existsSync, move, unlink } from "fs-extra";
import prisma from "../db/prisma";
import {
  EditReleaseParam,
  ReleaseWithArtist,
  Release,
  Track,
} from "@/types/types";
import { didReleaseInfoChange, mapSeries } from "@/lib/utils";
import {
  getRelease,
  getReleases,
  getSelectedReleases,
  getLatestAdditions,
  updateReleases,
  unGroupRelease,
  deleteRelease,
  addTracksToRelease,
  toggleHomepageVisibility,
  addAdditionalArtist as _addAdditionalArtist,
  removeAdditionalArtist as _removeAdditionalArtist,
  groupReleases as _groupReleases,
  type AdditionalArtistParams,
  type GroupReleaseParams,
} from "../db/release";
import { getArtist } from "../db/artist";
import { getEntityPath } from "../utils";
import { hashRelease } from "../hash";
import { searchCover, getImageFromURL } from "../covers";
import { log } from "../logger";
import { type StateManager } from "../stateManager";
import type { GetSetting } from "./settings";

type ReleaseControllerParams = {
  withPath: (key: string, folderPath: string) => string;
  getSetting: GetSetting;
  send: (channel: string, ...args: unknown[]) => void;
  showErrorBox: (title: string, content: string) => void;
  openConfirmDialog: (message: string, detail: string) => boolean;
  stateManager: StateManager;
  skipMove?: boolean;
};

export function releaseController({
  withPath,
  getSetting,
  send,
  stateManager,
  showErrorBox,
  openConfirmDialog,
  skipMove = false,
}: ReleaseControllerParams) {
  async function editRelease(infos: EditReleaseParam[]) {
    if (!infos.length) {
      return [];
    }

    const shouldJustRenameDiscs =
      infos.every(
        (x) =>
          x.path === x.newPath && x.year === x.newYear && x.type === x.newType
      ) && didReleaseInfoChange(infos);

    if (shouldJustRenameDiscs) {
      return await updateReleases(
        infos.map((x) => ({
          ...x,
          discTitle: infos.length === 1 ? null : x.newDiscTitle,
          title: x.newTitle,
          type: x.newType,
          year: x.newYear,
        }))
      );
    }

    const artist = await getArtist(infos[0].artist_id);

    for (const info of infos) {
      if (info.newPath.includes("../")) {
        showErrorBox(
          "Error while renaming",
          "Path cannot contain any '../' sequence"
        );
        return false;
      }
      const targetPath = withPath(
        "LIBRARY_PATH",
        getEntityPath({
          entityType: "Release",
          year: info.newYear,
          type: info.newType,
          path: info.newPath,
          artist,
        })
      );

      if (existsSync(targetPath)) {
        showErrorBox(
          "Error while renaming",
          `Path ${info.newPath} already exists`
        );
        return false;
      }
    }

    try {
      const USE_SMART_IMPORT = getSetting("USE_SMART_IMPORT");
      const newInfos = infos.map((x) => ({
        ...x,
        hash: hashRelease({
          ...x,
          type: x.newType,
          year: x.newYear,
        }),
        discTitle: infos.length === 1 ? null : x.newDiscTitle,
        path: x.newPath,
        completePath: USE_SMART_IMPORT
          ? getEntityPath({
              entityType: "Release",
              year: x.newYear,
              type: x.newType,
              path: x.newPath,
              artist,
            })
          : x.completePath,
        title: x.newTitle,
        type: x.newType,
        year: x.newYear,
      }));

      if (!skipMove) {
        await Promise.all(
          infos.map(async (x, index) => {
            const oldPath = withPath(
              "LIBRARY_PATH",
              getEntityPath({
                ...x,
                artist,
                entityType: "Release",
              })
            );
            const newPath = withPath(
              "LIBRARY_PATH",
              getEntityPath({
                artist,
                entityType: "Release",
                type: x.newType,
                year: x.newYear,
                path: x.newPath,
              })
            );

            if (!existsSync(oldPath)) {
              throw new Error(`Release ${x.id} not found at: ${oldPath}`);
            }

            if (oldPath === newPath) {
              return true;
            }

            await move(oldPath, newPath);

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
      }

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

    const { hash } = release;

    const COVERS_PATH = getSetting("COVERS_PATH") as string;

    const success = await getImageFromURL({
      outputPath: COVERS_PATH,
      hash,
      url,
    });
    if (success) {
      send("coverUpdate", [release]);
    }
    return success;
  }

  const THROTTLE_INTERVAL = 500;

  async function importCovers(
    releases: (ReleaseWithArtist & { tracks?: Track[] })[]
  ) {
    const COVERS_PATH = getSetting("COVERS_PATH") as string;
    const DISCOGS_KEY = getSetting("DISCOGS_KEY") as string;
    const DISCOGS_SECRET = getSetting("DISCOGS_SECRET") as string;

    return await mapSeries(
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
        send("coverUpdate", [release]);
        return pic;
      },
      THROTTLE_INTERVAL
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

  async function deleteReleases(release_ids: number[]) {
    const confirm = openConfirmDialog(
      `Are you sure to delete ${release_ids.length} Releases from library?`,
      "This action is not reversible!"
    );

    if (!confirm) {
      return;
    }

    await Promise.all(release_ids.map(deleteRelease));
    send("mutate", [
      ["releases", "latest"],
      ...release_ids.map((id) => ["releases", id]),
    ]);
    send("clearSelection");
    send("notify", {
      type: "success",
      message: `${release_ids.length} releases deleted`,
    });
  }

  async function addAdditionalArtist({
    release_id,
    artist_id,
  }: AdditionalArtistParams) {
    const result = await _addAdditionalArtist({ release_id, artist_id });
    send("mutate", [
      ["releases", release_id],
      ["artists", result.artist.id],
      ["artists", artist_id],
    ]);
    return result;
  }

  async function removeAdditionalArtist({
    release_id,
    artist_id,
  }: AdditionalArtistParams) {
    const result = await _removeAdditionalArtist({ release_id, artist_id });
    send("mutate", [
      ["releases", release_id],
      ["artists", result.artist.id],
      ["artists", artist_id],
    ]);
    return result;
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

  return {
    getRelease,
    getReleases,
    getSelectedReleases,
    getLatestAdditions,
    groupReleases,
    unGroupRelease,
    editRelease,
    deleteRelease,
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
  };
}

export const actions: (keyof ReturnType<typeof releaseController>)[] = [
  "getRelease",
  "getReleases",
  "getLatestAdditions",
  "groupReleases",
  "unGroupRelease",
  "editRelease",
  "deleteRelease",
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
];
