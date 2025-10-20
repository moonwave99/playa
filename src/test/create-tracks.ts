import { Lame } from "node-lame";

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
