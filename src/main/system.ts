import child_process from 'node:child_process';
import type { IpcMainEvent } from 'electron';
import path from "path";
import { existsSync } from 'node:fs';
import prisma from "./db/prisma";
import globby from "globby";
import sha1 from 'sha1';
import * as mm from 'music-metadata';
import { shell } from 'electron';
import { addTracksToRelease } from "./db/release";
import { searchCover, getImageFromURL } from "./discogs";
import { mapSeries } from '../lib/utils';
import type { ReleaseType, ReleaseWithArtist, TrackInfo } from "@/types/types";
import { getSetting } from './settings';

export async function importFolder(folder: string): Promise<ReleaseWithArtist[]> {
  const folders = await globby("**", {
    onlyDirectories: true,
    cwd: folder,
  });
  if (!folders.length) {
    const release = await importSingleFolder(folder);
    return [release];
  }

  const releases = await Promise.all(
    folders
      .filter((x) => !x.endsWith("]"))
      .map((f) => importSingleFolder(path.join(folder, f)))
  );
  return releases;
}

export async function getFolderContents(release: { path: string }): Promise<TrackInfo[]> {
  const contents = await crawlFolder(release.path);
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
    });
    if (!track) {
      return;
    }
    await run('open', ['-a', PLAYER_PATH, getReleasePath(track.path)]);
    return true;
  }

  const release = await prisma.release.findFirst({
    where: { id: release_id },
    include: {
      artist: true,
      tracks: { orderBy: { position: 'asc' } }
    },
  });

  if (!release) {
    return;
  }

  await run('open', ['-a', PLAYER_PATH, getReleasePath(release.path)]);
  return true;
}

export async function openTagger(release_id: number) {
  const release = await prisma.release.findFirst({
    where: { id: release_id },
    include: {
      artist: true,
      tracks: { orderBy: { position: 'asc' } }
    },
  });

  if (!release) {
    return;
  }

  const TAGGER_PATH = getSetting('TAGGER_PATH') as string;

  await run('open', ['-a', TAGGER_PATH, getReleasePath(release.path)]);
  return true;
}

export async function revealEntityInFinder(entity: 'release' | 'artist', id: number) {
  const result = await prisma[entity].findFirst({ where: { id } });
  if (!result) {
    return;
  }

  return shell.openPath(getReleasePath(result.path));
}

export async function importCovers(releases: ReleaseWithArtist[]) {
  const COVERS_PATH = getSetting('COVERS_PATH') as string;

  const foundCovers = await mapSeries(releases,
    (release: ReleaseWithArtist) => searchCover({ release, artist: release.artist, outputPath: COVERS_PATH })
  );

  return releases.filter((_, index) => !!foundCovers[index]);
}

export async function importMissingCovers(releases: ReleaseWithArtist[]) {
  const COVERS_PATH = getSetting('COVERS_PATH') as string;
  const releasesWithoutCover = releases.filter(
    ({ hash }) => !existsSync(path.join(COVERS_PATH, `${hash}-cover.jpg`))
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

  await getImageFromURL({ outputPath: COVERS_PATH, hash, url });
  return true;
}

export async function refreshReleaseContents(id: number) {
  const release = await prisma.release.findFirst({
    where: { id },
    include: { artist: true, subReleases: true }
  });

  if (!release) {
    return;
  }

  await Promise.all([release, ...release.subReleases].map(async (release) => {
    const tracks = await getFolderContents(release);
    await addTracksToRelease(release.id, tracks);
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
  const LIBRARY_PATH = getSetting('LIBRARY_PATH') as string;
  const files = await globby("*.{mp3,m4a,flac,wav,ogg,ape}", {
    cwd: path.join(LIBRARY_PATH, folder),
    caseSensitiveMatch: false
  });
  return files.map(file => path.join(folder, file));
}

async function getMetadata(filePath: string, index: number): Promise<TrackInfo> {
  const LIBRARY_PATH = getSetting('LIBRARY_PATH') as string;
  const data = await mm.parseFile(path.join(LIBRARY_PATH, filePath));
  return {
    path: filePath,
    title: data.common.title || path.basename(filePath),
    duration: data.format.duration || 0,
    position: data.common.track.no || index + 1
  };
}

function getReleasePath(folderPath: string) {
  const LIBRARY_PATH = getSetting('LIBRARY_PATH') as string;
  return path.join(LIBRARY_PATH, folderPath);
}

async function importSingleFolder(folder: string) {
  console.log('[importSingleFolder] Crawling:', folder);
  const contents = await crawlFolder(folder);
  if (!contents) {
    return;
  }
  const LIBRARY_PATH = getSetting('LIBRARY_PATH') as string;
  const releaseData = parsePath(folder.replace(LIBRARY_PATH, ""));
  if (!releaseData) {
    return false;
  }

  const artistPath = releaseData.path.split("/").slice(0, 2).join("/");
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

  console.log('[importSingleFolder] upserted artist', artist);

  const releaseHash = hashRelease(releaseData);
  const { artist: artistData, ...releaseWithoutArtist } = releaseData;
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

  const trackInfo = await getFolderContents(release);
  const fullRelease = await addTracksToRelease(release.id, trackInfo);

  console.log('[importSingleFolder] upserted release:', fullRelease);

  const COVERS_PATH = getSetting('COVERS_PATH') as string;

  await searchCover({
    release,
    artist,
    outputPath: COVERS_PATH,
  });

  return release;
}

type ParsePath = {
  artist: {
    name: string;
  },
  type: ReleaseType;
  path: string;
  year: number;
  title: string;
} | null;

export function parsePath(path: string): ParsePath {
  if (path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  if (path.startsWith("/")) {
    path = path.slice(1);
  }
  const tokens = path.split("/");
  const artist = tokens[1];
  const type = tokens[2] ? tokens[2].replace("[", "").replace("]", "") : 'Album';
  const rest = tokens.slice(4);

  if (rest.length) {
    return null;
  }

  return {
    artist: { name: artist },
    type: type as ReleaseType,
    path,
    ...parseTitle(tokens[3]),
  };
}

type ParseTitle = {
  year: number;
  title: string;
};

function parseTitle(title = ""): ParseTitle {
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

function hashRelease({ title, artist, year, type }: Pick<ReleaseWithArtist, "title" | 'year' | 'type'> & { artist: { name: string; } }) {
  return sha1([title, artist.name, year, type].join("-")).slice(0, 16);
}

type RunResponse = {
  code: number;
  stdout: string[];
  stderr: string[];
}

async function run(command: string, options: string[], cwd?: string): Promise<RunResponse> {
  return new Promise((resolve) => {
    const proc = child_process.spawn(command, options, cwd ? { cwd } : undefined);
    const messages: Pick<RunResponse, 'stdout' | 'stderr'> = {
      stdout: [],
      stderr: []
    };
    proc.stdout.on('data', (data) => {
      messages.stdout.push(`${data}`);
      console.log('[run:stdout]', `${data}`);
    });
    proc.stderr.on('data', (data) => {
      messages.stderr.push(`${data}`);
      console.log('[run:stderr]', `${data}`);
    });
    proc.on('exit', async (code) => {
      console.log('[run:exit]', {
        command: `${command} ${options.join(' ')}`,
        code
      });
      resolve({
        ...messages,
        code
      });
    });
  })
}