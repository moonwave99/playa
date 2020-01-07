import { shell } from 'electron';

interface HasPath {
  path: string;
}

export default class Finder {
  private musicPath: string;
  constructor(musicPath: string){
    this.musicPath = musicPath;
  }
  reveal(item: HasPath): void {
    shell.showItemInFolder(item.path);
  }
}
