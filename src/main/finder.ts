import { shell } from 'electron';
import { Album } from '../renderer/store/modules/album';

export default class Finder {
  private musicPath: string;
  constructor(musicPath: string){
    this.musicPath = musicPath;
  }
  reveal(album: Album): void {
    shell.showItemInFolder(album.path);
  }
}
