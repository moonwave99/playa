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
  TrackInfo,
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
import {
  DEFAULT_RELEASE_TYPE,
  DEFAULT_RELEASE_YEAR,
  MAX_IMPORT_FOLDERS,
  VARIOUS_ARTIST_POSSIBLE_FOLDERS,
  VARIOUS_ARTISTS_NAME,
} from "@/constants";

type ImportFoldersControllerParams = {
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

    const folderContents = await Promise.all(
      [release, ...release.subReleases].map(async (release) => ({
        id: release.id,
        contents: await getFolderContents(
          release as ReleaseWithArtist,
          getSetting("LIBRARY_PATH") as string
        ),
      }))
    );

    if (folderContents.some(({ contents }) => !contents.length)) {
      showErrorBox(
        "Error refreshing Release contents",
        folderContents.length > 1
          ? "Some folders of the current Release contain no tracks"
          : "The current Release folder contains no tracks."
      );
      return false;
    }

    const updatedReleases = await Promise.all(
      folderContents.map(({ id, contents }) => addTracksToRelease(id, contents))
    );

    send("mutate", [["releases", release.id]]);
    send("notify", {
      type: "success",
      message: `${release.title} contents refreshed`,
    });

    return updatedReleases;
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

  async function getArtistMatch(
    folder: string,
    trackInfo: TrackInfo[]
  ): Promise<{ id: number; name: string }> {
    const name = VARIOUS_ARTIST_POSSIBLE_FOLDERS.some((x) =>
      folder.toLowerCase().includes(x.toLowerCase())
    )
      ? VARIOUS_ARTISTS_NAME
      : (findKeyInTrackMeta(trackInfo, "artist") as string);

    const artist = await searchArtistByName(name);

    if (!artist) {
      return {
        id: null,
        name,
      };
    }

    return {
      id: artist.id,
      name: artist.name,
    };
  }

  async function getTracksInfo(folder: string): Promise<ImportData> {
    const tracks = await getFolderContentsFromAbsolutePath(folder);
    if (!tracks.length) {
      return null;
    }

    const LIBRARY_PATH = getSetting("LIBRARY_PATH") as string;

    return {
      artist: await getArtistMatch(folder, tracks),
      title:
        (findKeyInTrackMeta(tracks, "album") as string) ||
        path.basename(folder),
      year: +findKeyInTrackMeta(tracks, "year") || DEFAULT_RELEASE_YEAR,
      folder: path.basename(folder),
      path: stripPath(folder, LIBRARY_PATH),
      absolutePath: folder,
      type: DEFAULT_RELEASE_TYPE,
      tracks,
    };
  }

  async function importFromData(
    data: Omit<ImportData, "folder" | "absolutePath">
  ) {
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

        log("importFolders:importFromData", "created artist:", artist);
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

      log("importFolders:importFromData", "upserted release:", fullRelease);

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
      log("importFolders:importFromData", data, error);
      return false;
    }
  }

  async function openImportDialog() {
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

    const foldersToImport = await Promise.all(
      folders.filter((_, index) => !existingMap[index]).map(getTracksInfo)
    );

    const groupedByDisc = Object.values(
      Object.groupBy(
        foldersToImport.filter((x) => !!x),
        ({ title }) => title
      )
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

    openModal("importFolders", { data: groupedByDisc });
  }

  return {
    openImportDialog,
    importFromData,
    getTracksInfo,
    refreshReleaseContents,
    refreshEntityRelease,
    refreshArtistReleases,
  };
}

export const actions: (keyof ReturnType<typeof importFoldersController>)[] = [
  "openImportDialog",
  "importFromData",
  "getTracksInfo",
  "refreshReleaseContents",
  "refreshEntityRelease",
  "refreshArtistReleases",
];
