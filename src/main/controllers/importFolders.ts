import prisma from "../db/prisma";
import path from "node:path";
import { StateManager } from "../stateManager";
import { mapSeries, normalizeDiacritics } from "@/lib/utils";
import {
  ReleaseWithArtist,
  ArtistWithReleases,
  CollectionWithReleases,
  ImportData,
  ArtistWithReleasesFull,
  Send,
  OpenFolderDialog,
  OpenModal,
  ShowErrorBox,
} from "@/types/types";
import { searchCover } from "../covers";
import { addTracksToRelease } from "../db/release";
import { searchArtistByName } from "../db/artist";
import { hashArtistName, hashRelease } from "../hash";
import { log } from "../logger";
import {
  getFolderContents,
  getFolderContentsFromAbsolutePath,
  stripPath,
  findKeyInTrackMeta,
} from "../utils";
import type { GetSetting } from "./settings";
import { MAX_IMPORT_FOLDERS } from "@/constants";

type ImportFoldersControllerParams = {
  withPath: (key: string, folderPath: string) => string;
  getSetting: GetSetting;
  send: Send;
  openModal: OpenModal;
  stateManager: StateManager;
  openFolderDialog: OpenFolderDialog;
  showErrorBox: ShowErrorBox;
};

export function importFoldersController({
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
      await mapSeries(
        releasesToRefresh,
        ({ id }) => refreshReleaseContents(id),
        100
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
    send("mutate", [`${entity.entityType}s`, entity.id]);
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
          name: findKeyInTrackMeta(tracks, "artist"),
        },
        title:
          (findKeyInTrackMeta(tracks, "album") as string) ||
          path.basename(folders[index]),
        normalizedTitle: normalizeDiacritics(
          (findKeyInTrackMeta(tracks, "album") as string) ||
            path.basename(folders[index])
        ),
        year: +findKeyInTrackMeta(tracks, "year") || 1999,
        folder: path.basename(folders[index]),
        path: stripPath(folders[index], LIBRARY_PATH),
        type: "Album",
        tracks,
      }));

    const groupedByDisc = Object.values(
      Object.groupBy(foldersToImport, ({ title }) => title)
    ).flatMap((items) =>
      items.length === 1
        ? items
        : items
            .sort((a, b) => (a.path > b.path ? 1 : -1))
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

  async function importFromInteractiveData(data: Omit<ImportData, "folder">) {
    try {
      let artist = data.artist;
      if (!data.artist.id) {
        const artistHash = hashArtistName(data.artist.name);
        const normalizedName = normalizeDiacritics(data.artist.name);

        artist = await prisma.artist.upsert({
          where: {
            hash: artistHash,
          },
          update: {
            hash: artistHash,
            name: data.artist.name,
            normalizedName,
          },
          create: {
            hash: artistHash,
            name: data.artist.name,
            normalizedName,
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
        ["artists", "latest"],
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
    const LIBRARY_PATH = getSetting("LIBRARY_PATH") as string;

    if (!LIBRARY_PATH) {
      showErrorBox(
        "Error importing folders",
        "You have to set your Library path in the Settings"
      );
      return;
    }

    const folders = openFolderDialog({
      key: "importFolderPath",
      defaultPath: LIBRARY_PATH,
      properties: ["openDirectory", "multiSelections"],
    });

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
            path: stripPath(folder, LIBRARY_PATH),
          },
        })
      )
    );

    if (existingMap.length === 1 && !!existingMap[0]) {
      showErrorBox("Error importing Folders", "Folder already imported");
      return;
    }

    const foldersToImport = folders.filter((_, index) => !existingMap[index]);
    await startInteractiveImport(foldersToImport);
  }

  return {
    importFolderFromDialog,
    importFromInteractiveData,
    refreshReleaseContents,
    refreshEntityRelease,
    refreshArtistReleases,
  };
}

export const actions: (keyof ReturnType<typeof importFoldersController>)[] = [
  "importFolderFromDialog",
  "importFromInteractiveData",
  "refreshReleaseContents",
  "refreshEntityRelease",
  "refreshArtistReleases",
];
