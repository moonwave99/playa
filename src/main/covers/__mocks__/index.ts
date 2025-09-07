import { beforeEach } from "vitest";
import { mockReset } from "vitest-mock-extended";
import { type Release } from "@/types/types";
import { type GetImageFromURLParams } from "..";
import path from "path";
import { outputFile } from "fs-extra";

beforeEach(() => {
  mockReset(searchCover);
  mockReset(getImageFromURL);
});

export const getImageFromURL = vi.fn(
  async ({ outputPath, hash, url }: GetImageFromURLParams) => {
    if (url.includes("not-found")) {
      return false;
    }
    const fullOutputPath = path.join(outputPath, `${hash}-cover.jpg`);
    await outputFile(fullOutputPath, "", "utf-8");
    return fullOutputPath;
  }
);

export const searchCover = vi.fn(async ({ release }: { release: Release }) => {
  if (release.id === 3) {
    return null;
  }
  return `${release.hash}-cover.jpg`;
});
