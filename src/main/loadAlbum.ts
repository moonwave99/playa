import glob from 'globby';

import { MUSIC_FILE_EXTENSIONS } from '../constants';

//#TODO: fix db for [Ep] => [EP]
function escapePath(path: string): string {
  return path
    .replace(/\[Ep\]/g, '[EP]');
}

export default async function loadAlbum(path: string): Promise<string[]> {
  const pattern = `**/*.{${MUSIC_FILE_EXTENSIONS.join(',')}}`;
  return await glob(pattern, { cwd: escapePath(path), caseSensitiveMatch: false });
}
