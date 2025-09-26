import { existsSync, move, unlink } from "fs-extra";
import path from "path";
import prisma from "../db/prisma";
import { dialog, type OpenDialogSyncOptions } from "electron";
import { globby } from "globby";
import {
  ArtistWithReleases,
  CollectionWithReleases,
  EditReleaseParam,
  ReleaseWithArtist,
  ReleaseWithArtistAndTracks,
  Context,
  Release,
  Track,
  Artist,
} from "@/types/types";
import {
  didReleaseInfoChange,
  mapSeries,
  normalizeDiacritics,
} from "@/lib/utils";
import {
  getRelease,
  getReleases,
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
import {
  getEntityPath,
  crawlFolder,
  getFolderContents,
  parsePath,
} from "../utils";
import { hashRelease, hashArtistName } from "../hash";
import { searchCover, getImageFromURL } from "../covers";
import { log } from "../logger";
import { getSetting } from "../settings";
import { type StateManager } from "../state";

type ReleaseControllerParams = {
  withPath: (key: string, folderPath: string) => string;
  getSetting: (key: string) => ReturnType<typeof getSetting>;
  send: (channel: string, ...args: unknown[]) => void;
  state: StateManager;
  openFolderDialog: (
    defaultPath: string,
    properties: OpenDialogSyncOptions["properties"]
  ) => string[];
};

export function releaseController({
  withPath,
  getSetting,
  send,
  state,
  openFolderDialog,
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
        dialog.showMessageBoxSync(null, {
          message: "Error while renaming",
          detail: "Path cannot contain any '../' sequence",
          type: "error",
          buttons: ["OK"],
        });
        return false;
      }
      const targetPath = withPath(
        "LIBRARY_PATH",
        getEntityPath({
          entityType: "Release",
          year: info.newYear,
          type: info.newType,
          path: info.newPath,
          artist: artist as unknown as Artist,
        })
      );

      if (existsSync(targetPath)) {
        dialog.showMessageBoxSync(null, {
          message: "Error while renaming",
          detail: `Path ${info.newPath} already exists`,
          type: "error",
          buttons: ["OK"],
        });
        return false;
      }
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
        path: x.newPath,
        title: x.newTitle,
        type: x.newType,
        year: x.newYear,
      }));

      await Promise.all(
        infos.map(async (x, index) => {
          const oldPath = withPath(
            "LIBRARY_PATH",
            getEntityPath({
              ...x,
              artist: artist as unknown as Artist,
              entityType: "Release",
            })
          );
          const newPath = withPath(
            "LIBRARY_PATH",
            getEntityPath({
              ...x,
              artist: artist as unknown as Artist,
              entityType: "Release",
              type: x.newType,
              year: x.newYear,
              path: x.newPath,
            })
          );

          if (!existsSync(oldPath)) {
            throw new Error(`Release ${x.id} not found at: ${oldPath}`);
          }

          await move(oldPath, newPath);

          const oldCoverPath = withPath("COVERS_PATH", `${x.hash}-cover.jpg`);
          const newCoverPath = withPath(
            "COVERS_PATH",
            `${newInfos[index].hash}-cover.jpg`
          );

          if (!existsSync(oldCoverPath)) {
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
      dialog.showMessageBoxSync(null, {
        message: "Error while renaming",
        detail: error.message,
        type: "warning",
        buttons: ["OK"],
      });
      return false;
    }
  }

  async function importFolder(folder: string) {
    const folders = await globby("**", {
      onlyDirectories: true,
      cwd: folder,
    });

    if (!folders.length) {
      const release = await importSingleFolder(folder);
      return release ? [release] : [];
    }

    const releases = await Promise.all(
      folders
        .filter((x) => !x.endsWith("]"))
        .map((f) => importSingleFolder(path.join(folder, f)))
    );

    return releases.filter((x: unknown) => !!x);
  }

  async function importSingleFolder(folder: string) {
    log("release:importSingleFolder", "Crawling:", folder);
    const contents = await crawlFolder(folder);

    if (!contents.length) {
      return null;
    }
    const LIBRARY_PATH = getSetting("LIBRARY_PATH") as string;
    const releaseData = parsePath(folder.split(LIBRARY_PATH).at(1));

    if (!releaseData) {
      return null;
    }
    const artistPath = releaseData.fullPath.split("/").slice(0, 2).join("/");
    const artistHash = hashArtistName(releaseData.artist.name);
    const normalizedName = normalizeDiacritics(releaseData.artist.name);

    const artist = await prisma.artist.upsert({
      where: {
        hash: artistHash,
      },
      update: {
        hash: artistHash,
        name: releaseData.artist.name,
        normalizedName,
        path: artistPath,
      },
      create: {
        hash: artistHash,
        name: releaseData.artist.name,
        normalizedName,
        path: artistPath,
      },
    });

    log("release:importSingleFolder", "upserted artist", artist);

    const releaseHash = hashRelease({ ...releaseData, artist_id: artist.id });
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      artist: artistData,
      fullPath,
      title,
      ...releaseWithoutArtist
    } = releaseData;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    const normalizedTitle = normalizeDiacritics(title);
    const release = await prisma.release.upsert({
      where: {
        hash: releaseHash,
      },
      update: {
        hash: releaseHash,
        title,
        normalizedTitle,
        ...releaseWithoutArtist,
        artist_id: artist.id,
      },
      create: {
        hash: releaseHash,
        title,
        normalizedTitle,
        ...releaseWithoutArtist,
        artist_id: artist.id,
      },
    });

    const trackInfo = await getFolderContents(
      { ...release, artist: artist as Artist },
      getSetting("LIBRARY_PATH") as string
    );

    const fullRelease = await addTracksToRelease(release.id, trackInfo);

    log("release:importSingleFolder", "upserted release:", fullRelease);

    const COVERS_PATH = getSetting("COVERS_PATH") as string;
    const DISCOGS_KEY = getSetting("DISCOGS_KEY") as string;
    const DISCOGS_SECRET = getSetting("DISCOGS_SECRET") as string;

    await searchCover(
      {
        release,
        artist,
        track: fullRelease.tracks[0],
        outputPath: COVERS_PATH,
      },
      {
        DISCOGS_KEY,
        DISCOGS_SECRET,
      }
    );
    return fullRelease;
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

  async function refreshReleaseContents(id: number, context?: Context) {
    const release = await prisma.release.findFirst({
      where: { id },
      include: { artist: true, subReleases: { include: { artist: true } } },
    });

    if (!release) {
      return false;
    }

    log("release:refreshReleaseContents", release);
    const updatedRelease = await Promise.all(
      [release, ...release.subReleases].map(async (release) => {
        const tracks = await getFolderContents(
          release as ReleaseWithArtist,
          getSetting("LIBRARY_PATH") as string
        );
        log("release:refreshReleaseContents", "tracks", tracks);
        return addTracksToRelease(release.id, tracks);
      })
    );

    send("mutate", [
      ["releases", release.id],
      [`${context?.entityType.toLowerCase()}s`, context?.id],
    ]);

    return updatedRelease;
  }

  async function refreshCurrentArtistReleases() {
    const releasesToRefresh = state
      .getCurrentArtist()
      ?.releases.filter((x: ReleaseWithArtistAndTracks) => !x.tracks.length);

    if (!releasesToRefresh.length) {
      return;
    }
    state.setImporting(true);
    try {
      await Promise.all(
        releasesToRefresh.map((x: ReleaseWithArtistAndTracks) =>
          refreshReleaseContents(x.id)
        )
      );
      send("mutate", ["artists", state.getCurrentArtist().id]);
    } catch (error) {
      log("release:refreshCurrentArtistRelease]", error);
    }
    state.setImporting(false);
  }

  async function refreshEntityRelease(
    entity: ArtistWithReleases | CollectionWithReleases
  ) {
    await Promise.all(entity.releases.map((x) => refreshReleaseContents(x.id)));
    send("mutate", [`${entity.entityType.toLowerCase()}s`, entity.id]);
  }

  async function unGroupSelectedRelease() {
    const release = state.getSelectedReleases()[0];
    if (!release) {
      return;
    }
    await unGroupRelease(release);
    send("mutate", [
      ["releases", "latest"],
      ["artists", release.artist_id],
    ]);
    send("clearSelection");
    send("notify", { type: "success", message: "releases unGrouped" });
  }

  async function importFolderFromDialog() {
    const folders = openFolderDialog(
      withPath("LIBRARY_PATH", state.getCurrentArtist()?.path || ""),
      ["openDirectory", "multiSelections"]
    );
    if (!folders) {
      return;
    }
    const releases = await Promise.all(folders.map(importFolder));

    send("mutate", [
      ["releases", "latest"],
      ...releases.flat().map((x) => ["artists", x.artist_id]),
    ]);

    send("notify", {
      type: "success",
      message: `${releases.length} releases imported`,
    });
  }

  async function deleteReleases(release_ids: number[]) {
    const cancel = dialog.showMessageBoxSync(null, {
      message: `Are you sure to delete ${release_ids.length} Releases from library?`,
      detail: "This action is not reversible!",
      type: "warning",
      buttons: ["OK", "Cancel"],
      defaultId: 1,
    });

    if (cancel) {
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
    getLatestAdditions,
    groupReleases,
    unGroupRelease,
    editRelease,
    deleteRelease,
    deleteReleases,
    addTracksToRelease,
    importFolder,
    downloadCover,
    importCovers,
    importMissingCovers,
    deleteCover,
    refreshReleaseContents,
    refreshCurrentArtistReleases,
    unGroupSelectedRelease,
    importFolderFromDialog,
    refreshEntityRelease,
    hideRelease,
    showRelease,
    addAdditionalArtist,
    removeAdditionalArtist,
  };
}

export const actions = [
  "getRelease",
  "getReleases",
  "getLatestAdditions",
  "groupReleases",
  "unGroupRelease",
  "editRelease",
  "deleteRelease",
  "deleteReleases",
  "addTracksToRelease",
  "importFolder",
  "downloadCover",
  "importCovers",
  "importMissingCovers",
  "deleteCover",
  "refreshReleaseContents",
  "refreshCurrentArtistReleases",
  "unGroupSelectedRelease",
  "importFolderFromDialog",
  "refreshEntityRelease",
  "hideRelease",
  "showRelease",
  "addAdditionalArtist",
  "removeAdditionalArtist",
];
