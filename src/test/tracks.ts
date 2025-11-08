import path from "node:path";
import { pad } from "@/lib/utils";
import { Lame } from "node-lame";
import { ensureDir } from "fs-extra";

type CreateTrackParams = {
  outputPath: string;
  duration?: number;
  meta: {
    title?: string;
    artist?: string;
    album?: string;
    year?: string;
    track?: string;
  };
};

export async function createTrack({
  outputPath,
  duration = 1,
  meta,
}: CreateTrackParams) {
  return new Lame({
    output: outputPath,
    bitrate: 32,
    raw: true,
    sfreq: 11.025,
    meta,
  })
    .setBuffer(getBuffer(duration))
    .encode();
}

function getBuffer(duration: number) {
  const array = Array.from(Array(11025 * duration).keys()).map(() =>
    Math.random()
  );
  const size = Float64Array.BYTES_PER_ELEMENT;
  const buffer = Buffer.allocUnsafe(size * array.length);
  array.forEach((val, index) => buffer.writeDoubleLE(val, size * index));
  return buffer;
}

function getAlbumPath({
  libraryPath,
  artist,
  type = "Album",
  album,
  year = 2000,
  inVariousArtistsFolder = false,
  customPath,
}: CreateAlbumParams) {
  if (customPath) {
    return path.join(libraryPath, customPath);
  }
  if (inVariousArtistsFolder) {
    return path.join(
      libraryPath,
      "Various Artists",
      `[${type}]`,
      `${year} - ${album}`
    );
  }
  return path.join(
    libraryPath,
    artist.at(0).toUpperCase(),
    artist,
    `[${type}]`,
    `${year} - ${album}`
  );
}

type CreateAlbumParams = {
  libraryPath: string;
  artist: string;
  album: string;
  type?: string;
  year?: number;
  inVariousArtistsFolder?: boolean;
  customPath?: string;
  trackLength?: number;
};

export async function createAlbum(params: CreateAlbumParams) {
  const albumFolder = getAlbumPath(params);
  await ensureDir(albumFolder);
  const { artist, album, year, trackLength } = params;

  await Promise.all(
    Array.from({ length: trackLength || 5 }, (_, i) =>
      createTrack({
        outputPath: path.join(albumFolder, `${pad(i + 1)}.mp3`),
        meta: {
          title: `Track ${pad(i + 1)}`,
          artist,
          album,
          year: `${year}`,
        },
      })
    )
  );
}
