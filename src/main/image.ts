import path from 'path';
import download from "image-downloader";

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
