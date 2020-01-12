import { Client } from 'disconnect';
import * as fs from 'fs';
import * as Path from 'path';
import { EntityHashMap } from '../renderer/utils/store';
import { AlbumNotFoundError, FileSystemError } from '../errrors';

type Credentials = {
  consumerKey: string;
  consumerSecret: string;
}



export default class DiscogsClient {
  coversPath: string;
  credentials: Credentials;
  discogs: typeof Client;
  db: Function;
  cache: EntityHashMap<string>;
  constructor(coversPath: string, userAgent: string, credentials: Credentials) {
    this.coversPath = coversPath;
    this.credentials = credentials;
    this.discogs = new Client(userAgent, credentials);
    this.cache = {};
  }

  async getAlbumCover(artist: string, title: string, _id: string): Promise<string> {
    if (this.cache[_id]) {
      return this.cache[_id];
    }
    
    const imagePath = Path.join(this.coversPath, `${_id}.jpg`);
    if (fs.existsSync(imagePath)) {
      this.cache[_id] = imagePath;
      return this.cache[_id];
    }

    const imageData = await this._getAlbumCoverFromDiscogs(artist, title, _id);
    const result = await this._persistImage(imageData, imagePath);
    if (result) {
      this.cache[_id] = imagePath;
      return this.cache[_id];
    }
  }

  async _getAlbumCoverFromDiscogs(artist: string, title: string, _id: string): Promise<string> {
    const db = this.discogs.database();
    const { results } = await db.search({ artist, title });
    if (results.length === 0) {
      throw new AlbumNotFoundError(`No results for: [${_id}] ${artist} - ${title}`);
    }
    return await db.getImage(results[0].cover_image);
  }

  async _persistImage(imageData: string, imagePath: string): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        fs.writeFile(imagePath, imageData, 'binary', (error) => {
          if (error) {
            reject(error);
          }
          resolve(imagePath);
        })
      });
    } catch (error) {
      throw new FileSystemError(`Error writing to ${imagePath}`);
    }
  }
}
