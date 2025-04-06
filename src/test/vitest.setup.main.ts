import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import path from 'path';
import { getTrackPaths } from './utils';

vi.mock('electron', () => {
  return {
    shell: {
      openPath: vi.fn()
    },
    dialog: {
      showMessageBoxSync: vi.fn()
    },
  };
});

type GlobbyOptions = { cwd: string, onlyDirectories: boolean };

vi.mock('globby', () => {
  return {
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
  }
});

vi.mock('music-metadata', () => {
  return {
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
  }
});

afterEach(() => {
  cleanup();
});
