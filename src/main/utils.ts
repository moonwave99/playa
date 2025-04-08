import path from 'path';
import sha1 from 'sha1';
import * as mm from 'music-metadata';
import type {
  Artist, ReleaseType, Release, Entities, ReleaseWithArtist, TrackInfo, TrackWithRelease
} from "@/types/types";
import { globby } from 'globby';

type GetEntityPathParam = { _type: Entities } &
  (Pick<ReleaseWithArtist, 'artist' | 'path' | 'type' | 'year'>
    | Pick<TrackWithRelease, 'release' | 'path'>);

export function getEntityPath(entity: GetEntityPathParam) {
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

export function hashRelease({ title, artist_id, year, type, discNumber }: Pick<ReleaseWithArtist, 'title' | 'artist_id' | 'year' | 'type'> & { discNumber?: number }) {
  return sha1([title, artist_id, year, type, discNumber || 1].join("-")).slice(0, 16);
}


export function hashArtistName(name: string) {
  return sha1(name).slice(0, 16);
}

export async function crawlFolder(folder: string) {
  const files = await globby("*.{mp3,m4a,flac,wav,ogg,ape}", {
    cwd: folder,
    caseSensitiveMatch: false
  });
  return files.map(file => path.join(folder, file));
}

export async function getFolderContents(release: ReleaseWithArtist, library_path: string): Promise<TrackInfo[]> {
  const folder = path.join(library_path, getEntityPath({ ...release, _type: 'release' }));
  const contents = await crawlFolder(folder);
  return Promise.all(contents.map(getMetadata));
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