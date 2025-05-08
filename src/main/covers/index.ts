import path from 'path';
import download from "image-downloader";
import { log } from "../logger";
import type { Release, Artist, Track } from '@/types/types';
import { searchCover as deezerSearch } from './deezer';
import { searchCover as discogsSearch, type DiscogsSecrets } from './discogs';

export type GetImageFromURLParams = {
  outputPath: string;
  hash: string;
  url: string;
};

export async function getImageFromURL({ outputPath, hash, url }: GetImageFromURLParams) {
  const dest = path.join(outputPath, `${hash}-cover.jpg`);
  await download.image({ url, dest });
  return dest;
}

export function normalizeTitle(title: string) {
  return title
    .replace(/ CD(\d+)/, "")
    .replaceAll(/\(\w: (.*)\)/g, "")
    .replaceAll(" : ", " / ")
    .replaceAll("!", "")
    .trim();
}

export function normalizeArtist(artist: string) {
  if (artist === "_VV_AA_") {
    return "Various";
  }
  return artist.replaceAll("!", "");
}

type SearchCoverParams = {
  release: Release;
  artist: Artist;
  track?: Track;
  outputPath: string;
};

export async function searchCover(
  { release, artist, track, outputPath }: SearchCoverParams,
  secrets: DiscogsSecrets
) {
  const [deezerResult, discogsResult] = await Promise.all([
    deezerSearch({ release, artist, track }),
    discogsSearch({ release, artist }, secrets)
  ]);

  if (!deezerResult && !discogsResult) {
    log('covers:search', `No results for ${artist.name} - ${release.title}`);
    return false;
  }

  try {
    log('covers:search', `Downloading ${deezerResult || discogsResult}`);
    return await getImageFromURL({
      outputPath,
      hash: release.hash,
      url: deezerResult || discogsResult
    });
  } catch (error) {
    log('covers:search', error);
    return false;
  }
}