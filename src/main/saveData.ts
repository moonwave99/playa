import * as fs from 'fs';
import { FileSystemError } from '../errrors';

export async function saveData(
  data: string,
  path: string,
  format: 'binary' | 'utf8'
): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, data, format, (error) => {
        if (error) {
          reject(error);
        }
        resolve(path);
      })
    });
  } catch (error) {
    throw new FileSystemError(`Error writing to ${path}`);
  }
}
