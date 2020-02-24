import * as fs from 'fs';
import { FileSystemError } from '../../errors';

export async function saveData(
  data: string,
  path: string,
  format: 'binary' | 'utf8'
): Promise<boolean> {
  try {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, data, format, (error) => {
        if (error) {
          reject(error);
        }
        resolve(true);
      })
    });
  } catch (error) {
    throw new FileSystemError(`Error writing to ${path}`);
  }
}
