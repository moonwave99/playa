import * as fs from 'fs-extra';
import { FileSystemError } from '../../errors';

export async function saveData(
  data: string,
  path: string,
  format: 'binary' | 'utf8'
): Promise<void> {
  try {
    await fs.writeFile(path, data, format);
  } catch (error) {
    throw new FileSystemError(`Error writing to ${path}`);
  }
}
