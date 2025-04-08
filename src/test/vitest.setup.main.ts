import { afterEach } from 'vitest';
import path from 'path';
import { getTrackPaths } from './utils';
import { mockFsCleanup } from './mock-fs';
import prisma from '@/main/db/__mocks__/prisma';

type GlobbyOptions = { cwd: string, onlyDirectories: boolean };

vi.mock("electron", () => ({
  shell: {
    openPath: vi.fn(),
  },
  dialog: {
    showMessageBoxSync: vi.fn(),
    showOpenDialogSync: vi.fn((...args) => [args[1].defaultPath]),
  },
}));

vi.mock('globby', () => ({
  globby: (_: string, { cwd, onlyDirectories }: GlobbyOptions): string[] => {
    if (cwd.includes('empty/folder')) {
      return [];
    }
    if (onlyDirectories) {
      if (cwd.includes('Single Folder')) {
        return [];
      }
      return [
        '1999 - Album One',
        '2000 - Album Two'
      ];
    }
    return getTrackPaths();
  }
}));

vi.mock('music-metadata', () => ({
  parseFile: async (filePath: string) => {
    const index = parseInt(path.basename(filePath).split('-').at(0));
    return Promise.resolve({
      common: {
        title: `Track ${index}`,
        track: {
          no: index
        }
      },
      format: {
        duration: 123
      }
    });
  }
}));

beforeEach(async (context) => {
  await mockFsCleanup(context.task.id);
  prisma.$transaction.mockImplementation((x: unknown) => Promise.resolve(x));
});

afterEach(async (context) => {
  await mockFsCleanup(context.task.id);
});