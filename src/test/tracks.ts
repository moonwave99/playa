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

type CreateAlbumParams = {
  libraryPath: string;
  artist: string;
  album: string;
  type?: string;
  year?: number;
  inVariousArtistsFolder?: boolean;
};

export async function createAlbum({
  libraryPath,
  artist,
  type = "Album",
  album,
  year = 2000,
  inVariousArtistsFolder = false,
}: CreateAlbumParams) {
  const albumFolder = inVariousArtistsFolder
    ? path.join(
        libraryPath,
        "Various Artists",
        `[${type}]`,
        `${year} - ${album}`
      )
    : path.join(
        libraryPath,
        artist.at(0).toUpperCase(),
        artist,
        `[${type}]`,
        `${year} - ${album}`
      );
  await ensureDir(albumFolder);

  await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
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
