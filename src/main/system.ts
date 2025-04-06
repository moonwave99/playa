import path from "path";
import { existsSync, move } from 'fs-extra';
import prisma from "./db/prisma";
import { globby } from "globby";
import sha1 from 'sha1';
import * as mm from 'music-metadata';
import { dialog, shell, type IpcMainEvent } from 'electron';
import { addTracksToRelease, updateReleases } from "./db/release";
import { getArtist, updateArtist } from "./db/artist";
import { searchCover, getImageFromURL } from "./discogs";
import { mapSeries, didReleaseInfoChange } from '../lib/utils';
import { type Entities, type Artist, type TrackWithRelease, type ReleaseType, type ReleaseWithArtist, type TrackInfo, type EditReleaseParam, type Release, type ReleaseWithArtistAndTracks } from "@/types/types";
import { getSetting } from './settings';
import { send, getStateManager } from './state';
import { run } from './run';
import { log } from './logger';


export async function importFolder(folder: string): Promise<ReleaseWithArtistAndTracks[]> {
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

export async function getFolderContents(release: ReleaseWithArtist): Promise<TrackInfo[]> {
  const folder = withLibraryPath(getEntityPath({ ...release, _type: 'release' }));
  const contents = await crawlFolder(folder);
  return Promise.all(contents.map(getMetadata));
}

type PlaybackParams = {
  release_id: number;
  track_id?: number;
};

export async function playback({ release_id, track_id }: PlaybackParams) {
  const PLAYER_PATH = getSetting('PLAYER_PATH') as string;
  if (track_id) {
    const track = await prisma.track.findFirst({
      where: { id: track_id },
      include: {
        release: {
          include: { artist: true }
        }
      }
    });
    if (!track) {
      return false;
    }
    await run('open', ['-a', PLAYER_PATH, withLibraryPath(getEntityPath({ ...track, _type: 'track' }))]);
    return true;
  }

  const release = await prisma.release.findFirst({
    where: { id: release_id },
    include: { artist: true },
  });

  if (!release) {
    return false;
  }
  await run('open', ['-a', PLAYER_PATH, withLibraryPath(getEntityPath({ ...release, _type: 'release' }))]);
  return true;
}

export async function openTagger(release_id: number) {
  const release = await prisma.release.findFirst({
    where: { id: release_id },
    include: {
      artist: true
    },
  });

  if (!release) {
    return;
  }

  const TAGGER_PATH = getSetting('TAGGER_PATH') as string;

  await run('open', ['-a', TAGGER_PATH, withLibraryPath(getEntityPath({ ...release, _type: 'release' }))]);
  return true;
}

export async function revealEntityInFinder(entity: 'release' | 'artist', id: number) {
  let result;
  if (entity === 'release') {
    result = await prisma.release.findFirst({ where: { id }, include: { artist: true } });
  } else {
    result = await prisma.artist.findFirst({ where: { id } });
  }
  if (!result) {
    return;
  }
  await shell.openPath(withLibraryPath(getEntityPath({ ...result, _type: entity })));
  return true;
}

export async function importCovers(releases: ReleaseWithArtist[]) {
  const COVERS_PATH = getSetting('COVERS_PATH') as string;

  const foundCovers = await mapSeries(releases,
    (release: ReleaseWithArtist) => searchCover({ release, artist: release.artist, outputPath: COVERS_PATH })
  );
  return releases.filter((_, index) => !!foundCovers[index]);
}

export async function importMissingCovers(releases: ReleaseWithArtist[]) {
  const releasesWithoutCover = releases.filter(
    ({ hash }) => !existsSync(withCoversPath(`${hash}-cover.jpg`))
  );
  return importCovers(releasesWithoutCover);
}

export async function downloadCover({ id, url }: { id: number, url: string }) {
  const release = await prisma.release.findFirst({
    where: { id },
    include: { artist: true }
  });

  if (!release) {
    return false;
  }

  const { hash } = release;
  const COVERS_PATH = getSetting('COVERS_PATH') as string;

  const success = await getImageFromURL({ outputPath: COVERS_PATH, hash, url });
  if (success) {
    send('coverUpdate', [release]);
  }
  return success;
}

export async function refreshReleaseContents(id: number) {
  const release = await prisma.release.findFirst({
    where: { id },
    include: { artist: true, subReleases: { include: { artist: true } } }
  });

  if (!release) {
    return false;
  }

  return await Promise.all([release, ...release.subReleases].map(async (release) => {
    const tracks = await getFolderContents(release);
    return addTracksToRelease(release.id, tracks);
  }));
}

export function startDrag(folderPath: string, event?: IpcMainEvent) {
  const LIBRARY_PATH = getSetting('LIBRARY_PATH') as string;
  event.sender.startDrag({
    file: path.join(LIBRARY_PATH, folderPath),
    icon: path.resolve('folder.png')
  });
}

async function crawlFolder(folder: string) {
  const files = await globby("*.{mp3,m4a,flac,wav,ogg,ape}", {
    cwd: folder,
    caseSensitiveMatch: false
  });
  return files.map(file => path.join(folder, file));
}

async function getMetadata(filePath: string, index: number): Promise<TrackInfo> {
  const data = await mm.parseFile(filePath);
  return {
    path: path.basename(filePath),
    title: data.common.title || path.basename(filePath),
    duration: data.format.duration || 0,
    position: data.common.track.no || index + 1
  };
}

export function withLibraryPath(folderPath: string) {
  const LIBRARY_PATH = getSetting('LIBRARY_PATH') as string;
  return path.join(LIBRARY_PATH, folderPath);
}

export function withCoversPath(folderPath: string) {
  const COVERS_PATH = getSetting('COVERS_PATH') as string;
  return path.join(COVERS_PATH, folderPath);
}

async function importSingleFolder(folder: string) {
  log('[importSingleFolder] Crawling:', folder);
  const contents = await crawlFolder(folder);
  if (!contents.length) {
    return null;
  }
  const LIBRARY_PATH = getSetting('LIBRARY_PATH') as string;
  const releaseData = parsePath(folder.replace(LIBRARY_PATH, ""));

  if (!releaseData) {
    return null;
  }

  const artistPath = releaseData.fullPath.split("/").slice(0, 2).join("/");
  const artistHash = hashArtistName(releaseData.artist.name);

  const artist = await prisma.artist.upsert({
    where: {
      hash: artistHash,
    },
    update: {
      hash: artistHash,
      name: releaseData.artist.name,
      path: artistPath,
    },
    create: {
      hash: artistHash,
      name: releaseData.artist.name,
      path: artistPath,
    },
  });

  log('[importSingleFolder] upserted artist', artist);

  const releaseHash = hashRelease({ ...releaseData, artist_id: artist.id });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { artist: artistData, fullPath, ...releaseWithoutArtist } = releaseData;
  const release = await prisma.release.upsert({
    where: {
      hash: releaseHash,
    },
    update: {
      hash: releaseHash,
      ...releaseWithoutArtist,
      artist_id: artist.id,
    },
    create: {
      hash: releaseHash,
      ...releaseWithoutArtist,
      artist_id: artist.id,
    },
  });

  const trackInfo = await getFolderContents({ ...release, artist });
  const fullRelease = await addTracksToRelease(release.id, trackInfo);

  log('[importSingleFolder] upserted release:', fullRelease);

  const COVERS_PATH = getSetting('COVERS_PATH') as string;

  await searchCover({
    release,
    artist,
    outputPath: COVERS_PATH,
  });

  return fullRelease;
}

type ParsePath = Pick<Release, | 'type' | 'path' | 'year' | 'title'> & {
  artist: Pick<Artist, 'name'>;
  fullPath: string;
} | null;

export function parsePath(path: string): ParsePath {
  if (path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  if (path.startsWith("/")) {
    path = path.slice(1);
  }
  const tokens = path.split("/");
  if (tokens.length < 4) {
    return null;
  }

  const artist = tokens[1];
  const type = tokens[2] ? tokens[2].replace("[", "").replace("]", "") : 'Album';
  const rest = tokens.slice(4);

  if (rest.length) {
    return null;
  }

  const { year, title } = parseTitle(tokens[3]);

  return {
    artist: { name: artist },
    type: type as ReleaseType,
    year,
    title,
    path: title,
    fullPath: path
  };
}

export async function editRelease(infos: EditReleaseParam[]) {
  if (!infos.length) {
    return [];
  }

  const shouldJustRenameDiscs =
    infos.every(x => x.path === x.newPath) && didReleaseInfoChange(infos);

  if (shouldJustRenameDiscs) {
    return await updateReleases(infos.map(x => ({
      ...x,
      discTitle: infos.length === 1 ? null : x.newDiscTitle,
      title: x.newTitle,
      type: x.newType,
      year: x.newYear
    })));
  }

  const artist = await getArtist(infos[0].artist_id);

  for (const info of infos) {
    if (info.newPath.includes('../')) {
      dialog.showMessageBoxSync(null, {
        message: 'Error while renaming',
        detail: "Path cannot contain any '../' sequence",
        type: 'error',
        buttons: ['OK'],
      });
      return false;
    }
    const targetPath = withLibraryPath(getEntityPath({ ...info, _type: 'release', path: info.newPath, artist }));
    if (existsSync(targetPath)) {
      dialog.showMessageBoxSync(null, {
        message: 'Error while renaming',
        detail: `Path ${info.newPath} already exists`,
        type: 'error',
        buttons: ['OK'],
      });
      return false;
    }
  }

  try {
    const newInfos = infos.map(x => ({
      ...x,
      hash: hashRelease(({
        ...x,
        type: x.newType,
        year: x.newYear
      })),
      discTitle: infos.length === 1 ? null : x.newDiscTitle,
      path: x.newPath,
      title: x.newTitle,
      type: x.newType,
      year: x.newYear
    }));

    await Promise.all(infos.map(async (x, index) => {
      const oldPath = withLibraryPath(getEntityPath(({ ...x, artist, _type: 'release' })));
      const newPath = withLibraryPath(getEntityPath(({
        ...x,
        artist,
        _type: 'release',
        type: x.newType,
        year: x.newYear,
        path: x.newPath,
      })));


      if (!existsSync(oldPath)) {
        throw new Error(`Release ${x.id} not found at: ${oldPath}`);
      }

      await move(oldPath, newPath);

      const oldCoverPath = withCoversPath(`${x.hash}-cover.jpg`);
      const newCoverPath = withCoversPath(`${newInfos[index].hash}-cover.jpg`);

      if (!existsSync(oldCoverPath)) {
        return true;
      }

      await move(oldCoverPath, newCoverPath);
      return true;
    }));

    return await updateReleases(newInfos);
  } catch (error) {
    log('[renameRelease]', error);
    log('[renameRelease]', infos);
    dialog.showMessageBoxSync(null, {
      message: 'Error while renaming',
      detail: error.message,
      type: 'warning',
      buttons: ['OK'],
    });
    return false;
  }
}

type EditArtistParams = Artist & {
  newPath: string;
  newName: string;
}

export async function editArtist(infos: EditArtistParams) {
  const shouldMoveArtist = infos.newPath !== infos.path;
  if (shouldMoveArtist && existsSync(withLibraryPath(infos.newPath))) {
    dialog.showMessageBoxSync(null, {
      message: 'Error while renaming',
      detail: `Path ${infos.newPath} already exists`,
      type: 'error',
      buttons: ['OK'],
    });
    return false;
  }

  if (shouldMoveArtist) {
    await move(
      withLibraryPath(infos.path),
      withLibraryPath(infos.newPath),
    );
  }

  const updatedArtist = await updateArtist(infos.id, {
    name: infos.newName,
    path: infos.newPath
  });

  getStateManager()?.setCurrentArtist(updatedArtist);

  return true;
}

function parseTitle(title = ""): Pick<Release, 'year' | 'title'> {
  const match = title.match(/^(\d{4}) - (.*)/);
  if (!match) {
    return {
      title,
      year: 0
    };
  }
  return {
    year: Number(match[1]),
    title: match[2],
  };
}

function hashArtistName(name: string) {
  return sha1(name).slice(0, 16);
}

function hashRelease({ title, artist_id, year, type, discNumber }: Pick<ReleaseWithArtist, 'title' | 'artist_id' | 'year' | 'type'> & { discNumber?: number }) {
  return sha1([title, artist_id, year, type, discNumber || 1].join("-")).slice(0, 16);
}

type GetEntityPathParam = { _type: Entities } &
  (Pick<ReleaseWithArtist, 'artist' | 'path' | 'type' | 'year'>
    | Pick<TrackWithRelease, 'release' | 'path'>);

function getEntityPath(entity: GetEntityPathParam) {
  if (entity._type === 'artist') {
    return entity.path;
  }
  if (entity._type === 'release') {
    const release = entity as ReleaseWithArtist;
    return path.join(release.artist.path, `[${release.type}]`, `${release.year} - ${release.path}`);
  }
  const track = entity as TrackWithRelease;
  return path.join(
    track.release.artist.path,
    `[${track.release.type}]`,
    `${track.release.year} - ${track.release.path}`,
    track.path
  );
}