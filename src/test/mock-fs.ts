import path from 'path';
import { ensureDir, outputFile, remove } from 'fs-extra';
import { isEmpty } from 'lodash';

const TMP_DIR = '__mock-fs__';

export type Tree = Record<string, unknown>;

async function createTree(tree: Tree, rootDir: string): Promise<unknown> {
  if (isEmpty(tree)) {
    return ensureDir(rootDir);
  }
  return Promise.all(Object.entries(tree).map(([key, value]): Promise<unknown> => {
    if (typeof value === 'string') {
      return outputFile(path.join(rootDir, key), value, 'utf8');
    }
    return createTree(value as Tree, path.join(rootDir, key));
  }));
}

export async function mockFs(tree: Tree, context_id: string) {
  if (!context_id) {
    return '';
  }
  const directory = path.join(__dirname, TMP_DIR, context_id);
  await ensureDir(directory);
  await createTree(tree, directory);
  return directory;
}

export async function mockFsCleanup(id = '') {
  return remove(path.join(__dirname, TMP_DIR, id));
}