import { beforeEach } from 'vitest';
import { mockReset } from 'vitest-mock-extended';
import { type Release } from '@/types/types';
import { getImageFromURL, type GetImageFromURLParams } from '../image';
import path from 'path';
import { outputFile } from 'fs-extra';

beforeEach(() => {
  mockReset(searchCover);
  mockReset(getImageFromURL);
});

vi.mock('../image', () => ({
  getImageFromURL: vi.fn(async ({ outputPath, hash, url }: GetImageFromURLParams) => {
    if (url.includes('not-found')) {
      return false;
    }
    const fullOutputPath = path.join(outputPath, `${hash}-cover.jpg`);
    await outputFile(fullOutputPath, '', 'utf-8');
    return fullOutputPath;
  })
}));

export const searchCover = vi.fn(({ release }: { release: Release }) => {
  if (release.id === 3) {
    return null;
  }
  return `${release.hash}-cover.jpg`;
});