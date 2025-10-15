import { OpenDialogSyncOptions } from "electron";
import prisma from "../db/prisma";
import path from "node:path";
import { getSetting } from "../settings";
import { StateManager } from "../stateManager";
import { normalizeDiacritics } from "@/lib/utils";
import {
  ReleaseWithArtist,
  ReleaseWithArtistAndTracks,
  ArtistWithReleases,
  CollectionWithReleases,
  Artist,
} from "@/types/types";
import { globby } from "globby";
import { searchCover } from "../covers";
import { addTracksToRelease } from "../db/release";
import { hashArtistName, hashRelease } from "../hash";
import { log } from "../logger";
import {
  getFolderContents,
  crawlFolder,
  getArtistPathFromReleaseData,
  parsePath,
} from "../utils";

type ImportFoldersControllerParams = {
  withPath: (key: string, folderPath: string) => string;
  getSetting: (key: string) => ReturnType<typeof getSetting>;
  send: (channel: string, ...args: unknown[]) => void;
  stateManager: StateManager;
  openFolderDialog: (
    defaultPath: string,
    properties: OpenDialogSyncOptions["properties"]
  ) => string[];
  showErrorBox: (title: string, content: string) => void;
};

type ProgressCallback = (folder: string, completed?: boolean) => void;

export function importFoldersController({
  withPath,
  getSetting,
  send,
  stateManager,
  openFolderDialog,
  showErrorBox,
}: ImportFoldersControllerParams) {
  async function refreshReleaseContents(id: number) {
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

    send("mutate", [["releases", release.id]]);
    send("notify", {
      type: "success",
      message: `${release.title} contents refreshed`,
    });

    return updatedRelease;
  }

  async function refreshCurrentArtistReleases() {
    const releasesToRefresh = stateManager
      .getCurrentArtist()
      ?.releases.filter((x: ReleaseWithArtistAndTracks) => !x.tracks.length);

    if (!releasesToRefresh.length) {
      return;
    }
    stateManager.setImporting(true);
    try {
      await Promise.all(
        releasesToRefresh.map((x: ReleaseWithArtistAndTracks) =>
          refreshReleaseContents(x.id)
        )
      );
      send("mutate", ["artists", stateManager.getCurrentArtist().id]);
    } catch (error) {
      log("release:refreshCurrentArtistRelease]", error);
    }
    stateManager.setImporting(false);
  }

  async function refreshEntityRelease(
    entity: ArtistWithReleases | CollectionWithReleases
  ) {
    await Promise.all(entity.releases.map((x) => refreshReleaseContents(x.id)));
    send("mutate", [`${entity.entityType.toLowerCase()}s`, entity.id]);
  }

  async function importFolderFromDialog() {
    const folders = openFolderDialog(
      withPath("LIBRARY_PATH", stateManager.getCurrentArtist()?.path || ""),
      ["openDirectory", "multiSelections"]
    );

    if (!folders) {
      return;
    }

    const LIBRARY_PATH = getSetting("LIBRARY_PATH") as string;

    if (folders.some((folder) => !folder.startsWith(LIBRARY_PATH))) {
      showErrorBox(
        "Error importing folders",
        "The folders should be contained in your Library."
      );
      return;
    }

    send("openImportFolders");

    function onProgress(folder: string, completed = false) {
      send("import:progress", folder, completed);
    }

    const output = await Promise.all(
      folders.map((folder) => importFolder(folder, onProgress))
    );
    const importedReleases = output.flat();

    send("import:progress", "done");

    send("mutate", [
      ["releases", "latest"],
      ...importedReleases.map((x) => ["artists", x.artist_id]),
    ]);

    send("notify", {
      type: "success",
      message: `${importedReleases.length} releases imported`,
    });
  }

  async function importFolder(folder: string, onProgress: ProgressCallback) {
    const folders = await globby("**", {
      onlyDirectories: true,
      cwd: folder,
    });

    if (!folders.length) {
      const release = await importSingleFolder(folder, onProgress);
      return release ? [release] : [];
    }

    const releases = await Promise.all(
      folders
        .filter((x) => !x.endsWith("]"))
        .map((f) => importSingleFolder(path.join(folder, f), onProgress))
    );

    onProgress("done");
    return releases.filter((x: unknown) => !!x);
  }

  async function importSingleFolder(
    folder: string,
    onProgress: ProgressCallback
  ) {
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

    onProgress(folder);

    const artistPath = getArtistPathFromReleaseData(releaseData);
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
    const { artist: artistData, title, ...releaseWithoutArtist } = releaseData;
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
      LIBRARY_PATH
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

    onProgress(folder, true);
    return fullRelease;
  }

  return {
    importFolder,
    importFolderFromDialog,
    refreshReleaseContents,
    refreshEntityRelease,
    refreshCurrentArtistReleases,
  };
}

export const actions: (keyof ReturnType<typeof importFoldersController>)[] = [
  "importFolder",
  "importFolderFromDialog",
  "refreshReleaseContents",
  "refreshEntityRelease",
  "refreshCurrentArtistReleases",
];
