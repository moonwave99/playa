import { shell } from 'electron';

export function reveal(path: string): void {
  shell.showItemInFolder(path);
}
