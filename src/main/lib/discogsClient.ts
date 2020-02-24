import { Client } from 'disconnect';
import * as fs from 'fs';
import * as Path from 'path';
import { saveData } from './saveData';
import { EntityHashMap } from '../../renderer/utils/storeUtils';
import log, { LogContext, LogLevel } from './logger';
import { AlbumNotFoundError } from '../../errors';

type Credentials = {
  consumerKey: string;
  consumerSecret: string;
}

type DiscogsClientParams = {
  coversPath: string;
  userAgent: string;
  credentials: Credentials;
  disabled?: boolean;
  debug?: boolean;
};

export default class DiscogsClient {
  coversPath: string;
  credentials: Credentials;
  discogs: typeof Client;
  db: Function;
  cache: EntityHashMap<string>;
  notFoundCache: EntityHashMap<boolean>;
  disabled: boolean;
  debug: boolean;
  constructor({
    coversPath,
    userAgent,
    credentials,
    disabled = false,
    debug = false
  }: DiscogsClientParams) {
    this.coversPath = coversPath;
    this.credentials = credentials;
    this.discogs = new Client(userAgent, credentials);
    this.cache = {};
    this.notFoundCache = {};
    this.disabled = disabled;
    this.debug = debug;
  }

  async getAlbumCover(artist: string, title: string, _id: string): Promise<string> {
    if (this.notFoundCache[_id]) {
      return null;
    }
    if (this.cache[_id]) {
      return this.cache[_id];
    }

    const imagePath = Path.join(this.coversPath, `${_id}.jpg`);
    let imageFound = false;
    try {
      imageFound = fs.existsSync(imagePath);
    } catch(_error) {
      imageFound = false;
    }
    if (imageFound) {
      this.cache[_id] = imagePath;
      this.notFoundCache[_id] = false;
      return this.cache[_id];
    }

    if (this.disabled) {
      return '';
    }

    let imageData;
    try {
      imageData = await this._getAlbumCoverFromDiscogs(artist, title, _id);
    } catch (error) {
      if (error instanceof AlbumNotFoundError) {
        log({
          context: LogContext.Discogs,
          level: LogLevel.Warning,
          message: `No cover found for ${artist} - ${title} [${_id}]`
        });
        this.notFoundCache[_id] = true;
        return null;
      }
    }
    const result = await saveData(imageData, imagePath, 'binary');
    return this._updateCache(result, _id, imagePath);
  }

  async getAlbumCoverFromURL(_id: string, url = ''): Promise<string> {
    const imagePath = Path.join(this.coversPath, `${_id}.jpg`);
    let result: boolean = null;
    if (url.startsWith('http')) {
      const db = this.discogs.database();
      const imageData = await db.getImage(url);
      result = await saveData(imageData, imagePath, 'binary');
    } else {
      result = await new Promise((resolve, reject) => {
        fs.copyFile(url, imagePath, (err) => {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
      });
    }
    return this._updateCache(result, _id, imagePath);
  }

  async _getAlbumCoverFromDiscogs(artist: string, title: string, _id: string): Promise<string> {
    const db = this.discogs.database();
    const { results } = await db.search({ artist, title });
    if (results.length === 0) {
      throw new AlbumNotFoundError(`No results for: [${_id}] ${artist} - ${title}`);
    }
    return await db.getImage(results[0].cover_image);
  }

  _updateCache(result: boolean, _id: string, imagePath: string): string {
    if (result) {
      this.cache[_id] = imagePath;
      this.notFoundCache[_id] = false;
      return this.cache[_id];
    } else {
      this.notFoundCache[_id] = true;
      return null;
    }
  }
}
