import { OpenDialogSyncOptions } from "electron";
import prisma from "../db/prisma";
import path from "node:path";
import { getSetting } from "../settings";
import { StateManager } from "../stateManager";
import { normalizeDiacritics } from "@/lib/utils";
import {
  ReleaseWithArtist,
  ArtistWithReleases,
  CollectionWithReleases,
  Artist,
  ImportData,
  ArtistWithReleasesFull,
} from "@/types/types";
import { globby } from "globby";
import { searchCover } from "../covers";
import { addTracksToRelease } from "../db/release";
import { searchArtistByName } from "../db/artist";
import { hashArtistName, hashRelease } from "../hash";
import { log } from "../logger";
import {
  getFolderContents,
  getFolderContentsFromAbsolutePath,
  crawlFolder,
  getArtistPathFromReleaseData,
  parsePath,
  stripPath,
} from "../utils";
import type { send, openModal } from "./init";

type ImportFoldersControllerParams = {
  withPath: (key: string, folderPath: string) => string;
  getSetting: (key: string) => ReturnType<typeof getSetting>;
  send: typeof send;
  openModal: typeof openModal;
  stateManager: StateManager;
  openFolderDialog: (
    defaultPath: string,
    properties: OpenDialogSyncOptions["properties"]
  ) => string[];
  showErrorBox: (title: string, content: string) => void;
};

type ProgressCallback = (folder: string, completed?: boolean) => void;

const MAX_IMPORT_FOLDERS = 10;

export function importFoldersController({
  withPath,
  getSetting,
  send,
  openModal,
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

    log("importFolders:refreshReleaseContents", release);
    const updatedRelease = await Promise.all(
      [release, ...release.subReleases].map(async (release) => {
        const tracks = await getFolderContents(
          release as ReleaseWithArtist,
          getSetting("LIBRARY_PATH") as string
        );
        log("importFolders:refreshReleaseContents", "tracks", tracks);
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

  async function refreshArtistReleases(artist: ArtistWithReleasesFull) {
    const releasesToRefresh = artist.releases.filter(
      ({ tracks }) => !tracks.length
    );

    if (!releasesToRefresh.length) {
      return;
    }
    stateManager.setImporting(true);
    try {
      await Promise.all(
        releasesToRefresh.map(({ id }) => refreshReleaseContents(id))
      );
      send("mutate", ["artists", artist.id]);
    } catch (error) {
      log("importFolders:refreshArtistReleases", error);
      send("notify", {
        type: "error",
        message: "Error refreshing Artist Releases",
      });
    }
    stateManager.setImporting(false);
  }

  async function refreshEntityRelease(
    entity: ArtistWithReleases | CollectionWithReleases
  ) {
    await Promise.all(entity.releases.map((x) => refreshReleaseContents(x.id)));
    send("mutate", [`${entity.entityType.toLowerCase()}s`, entity.id]);
  }

  async function startInteractiveImport(folders: string[]) {
    const data = await Promise.all(
      folders.map(async (folder) => {
        const tracks = await getFolderContentsFromAbsolutePath(folder);
        const artist = await searchArtistByName(tracks.at(0)?.trackArtist);
        return { tracks, artist };
      })
    );

    const LIBRARY_PATH = getSetting("LIBRARY_PATH") as string;

    const foldersToImport = data
      .filter(({ tracks }) => !!tracks.length)
      .map(({ tracks, artist }, index) => ({
        artist: artist || {
          id: null as number,
          name: tracks[0].trackArtist,
        },
        title: tracks[0].meta.album || path.basename(folders[index]),
        normalizedTitle: normalizeDiacritics(
          tracks[0].meta.album || path.basename(folders[index])
        ),
        year: tracks[0].meta.year || 1999,
        path: path.basename(folders[index]),
        completePath: stripPath(folders[index], LIBRARY_PATH),
        type: "Album",
        tracks,
      }));

    const groupedByDisc = Object.values(
      Object.groupBy(foldersToImport, (x) => x.title)
    ).flatMap((items) =>
      items.length === 1
        ? items
        : items
            .sort((a, b) => (a.completePath > b.completePath ? 1 : -1))
            .map((item, index) => ({
              ...item,
              discNumber: index + 1,
              title: `${item.title} (Disc ${index + 1})`,
            }))
    );

    if (!groupedByDisc.length) {
      showErrorBox(
        "Error importing Folders",
        "All selected folders are empty."
      );
      return;
    }
    openModal("interactiveImport", { data: groupedByDisc });
  }

  async function importFromInteractiveData(data: ImportData) {
    try {
      let artist = data.artist;
      if (!data.artist.id) {
        artist = await prisma.artist.create({
          data: {
            name: data.artist.name,
            hash: hashArtistName(data.artist.name),
          },
        });

        log(
          "importFolders:importFromInteractiveData",
          "created artist:",
          artist
        );
      }
      const release = await prisma.release.create({
        data: {
          artist_id: artist.id,
          hash: hashRelease({ artist_id: artist.id, ...data }),
          completePath: data.completePath,
          path: data.path,
          title: data.title,
          normalizedTitle: normalizeDiacritics(data.title),
          year: data.year,
          type: data.type,
        },
      });

      const fullRelease = await addTracksToRelease(release.id, data.tracks);

      log(
        "importFolders:importFromInteractiveData",
        "upserted release:",
        fullRelease
      );

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

      send("mutate", [
        ["releases", "latest"],
        ["artists", artist.id],
      ]);

      send("notify", {
        type: "success",
        message: `${release.title} imported`,
      });

      return fullRelease;
    } catch (error) {
      log("importFolders:importFromInteractiveData", data, error);
      return false;
    }
  }

  async function importFolderFromDialog() {
    let path = "";
    if (stateManager.isPage("artist")) {
      const artist = (await stateManager.getCurrentEntity()) as Artist;
      path = artist?.path;
    }

    const folders = openFolderDialog(withPath("LIBRARY_PATH", path), [
      "openDirectory",
      "multiSelections",
    ]);

    if (!folders) {
      return;
    }

    if (folders.length > MAX_IMPORT_FOLDERS) {
      showErrorBox(
        "Error importing folders",
        `You can import at max ${MAX_IMPORT_FOLDERS} folders at once`
      );
      return;
    }

    const USE_SMART_IMPORT = getSetting("USE_SMART_IMPORT");
    const LIBRARY_PATH = getSetting("LIBRARY_PATH") as string;

    if (folders.some((folder) => !folder.startsWith(LIBRARY_PATH))) {
      showErrorBox(
        "Error importing folders",
        "The folders should be contained in your Library."
      );
      return;
    }

    const existingMap = await Promise.all(
      folders.map((folder) =>
        prisma.release.findFirst({
          where: {
            completePath: stripPath(folder, LIBRARY_PATH),
          },
        })
      )
    );

    const foldersToImport = folders.filter((_, index) => !existingMap[index]);

    if (!USE_SMART_IMPORT) {
      await startInteractiveImport(foldersToImport);
      return;
    }

    openModal("importFolders");

    function onProgress(folder: string, completed = false) {
      send("importProgress", folder, completed);
    }

    const output = await Promise.all(
      foldersToImport.map((folder) => importFolder(folder, onProgress))
    );
    const importedReleases = output.flat();

    send("importProgress", "done");

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
    log("importFolders:importSingleFolder", "Crawling:", folder);
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

    log("importFolders:importSingleFolder", "upserted artist", artist);

    const releaseHash = hashRelease({ ...releaseData, artist_id: artist.id });
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { artist: artistData, title, ...releaseWithoutArtist } = releaseData;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    const normalizedTitle = normalizeDiacritics(title);

    const completePath = stripPath(releaseData.completePath, LIBRARY_PATH);

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
        completePath,
      },
      create: {
        hash: releaseHash,
        title,
        normalizedTitle,
        ...releaseWithoutArtist,
        artist_id: artist.id,
        completePath,
      },
    });

    const trackInfo = await getFolderContents(
      { ...release, artist: artist as Artist },
      LIBRARY_PATH
    );

    const fullRelease = await addTracksToRelease(release.id, trackInfo);

    log("importFolders:importSingleFolder", "upserted release:", fullRelease);

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
    importFromInteractiveData,
    refreshReleaseContents,
    refreshEntityRelease,
    refreshArtistReleases,
  };
}

export const actions: (keyof ReturnType<typeof importFoldersController>)[] = [
  "importFolder",
  "importFolderFromDialog",
  "importFromInteractiveData",
  "refreshReleaseContents",
  "refreshEntityRelease",
  "refreshArtistReleases",
];
