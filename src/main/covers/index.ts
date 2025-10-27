import path from "path";
import prisma from "../db/prisma";
import download from "image-downloader";
import { log } from "../logger";
import type { Release, Artist, Track } from "@/types/types";
import { searchCover as deezerSearch } from "./deezer";
import { searchCover as discogsSearch, type DiscogsSecrets } from "./discogs";
import { VARIOUS_ARTISTS_NAME } from "@/lib/utils";
import { Vibrant } from "node-vibrant/node";
import { IS_E2E_TEST } from "@/test/utils";

export type GetImageFromURLParams = {
  outputPath: string;
  hash: string;
  url: string;
};

export async function getImageFromURL({
  outputPath,
  hash,
  url,
}: GetImageFromURLParams) {
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
  if (artist === VARIOUS_ARTISTS_NAME) {
    return "Various";
  }
  return artist.replaceAll("!", "");
}

type SearchCoverParams = {
  release: Pick<Release, "id" | "title" | "hash">;
  artist: Pick<Artist, "name">;
  track?: Pick<Track, "title">;
  outputPath: string;
};

export async function searchCover(
  { release, artist, track, outputPath }: SearchCoverParams,
  secrets: DiscogsSecrets
) {
  if (IS_E2E_TEST) {
    return false;
  }

  const [deezerResult, discogsResult] = await Promise.all([
    deezerSearch({ release, artist, track }),
    discogsSearch({ release, artist }, secrets),
  ]);

  if (!deezerResult && !discogsResult) {
    log("covers:search", `No results for ${artist.name} - ${release.title}`);
    return false;
  }

  try {
    log("covers:search", `Downloading ${deezerResult || discogsResult}`);
    const imagePath = await getImageFromURL({
      outputPath,
      hash: release.hash,
      url: deezerResult || discogsResult,
    });
    if (!imagePath) {
      return false;
    }
    await updateCoverInfo(release.id, imagePath);
    return imagePath;
  } catch (error) {
    log("covers:search", error);
    return false;
  }
}

export async function updateCoverInfo(id: number, imagePath: string) {
  try {
    const palette = await Vibrant.from(imagePath).getPalette();
    return await prisma.release.update({
      where: { id },
      data: {
        colorInfo: {
          color: palette.Vibrant.hex,
          darkText: isTextDark(palette.Vibrant.hex),
        },
      },
    });
  } catch (error) {
    log("covers:updateCoverInfo", error);
    return false;
  }
}

// see: https://stackoverflow.com/a/41491220/1073758
function isTextDark(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result) {
    return false;
  }

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  const colors = [r / 255, g / 255, b / 255];
  const c = colors.map((color) => {
    if (color <= 0.03928) {
      return color / 12.92;
    }
    return Math.pow((color + 0.055) / 1.055, 2.4);
  });

  const luminance = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return luminance > 0.179;
}
