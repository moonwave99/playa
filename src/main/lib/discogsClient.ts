import { Client } from 'disconnect';
import * as fs from 'fs-extra';
import * as Path from 'path';
import { saveData } from './saveData';
import { EntityHashMap } from '../../renderer/utils/storeUtils';
import log, { LogContext, LogLevel } from './logger';
import { ResourceNotFoundError } from '../../errors';
import jimp from 'jimp';

import { COVER_WIDTH, COVER_JPEG_QUALITY } from '../../constants';

export const DISCOGS_VARIOUS_ARTISTS_ID = 'Various';

type CacheEntry = {
  fromCache: boolean;
  entry: string;
}

class Cache {
  private cache: EntityHashMap<string>;
  private notFoundCache: EntityHashMap<boolean>;
  constructor() {
    this.cache = {};
    this.notFoundCache = {};
  }
  get(_id: string): CacheEntry {
    const entry = this.cache[_id];
    return {
      entry,
      fromCache: !!this.notFoundCache[_id]
    }
  }
  set(_id: string, entry: string): void {
    this.cache[_id] = entry;
    if (this.notFoundCache) {
      this.notFoundCache[_id] = false;
    }
  }
  setNotFound(_id: string): void {
    this.notFoundCache[_id] = true;
  }
}

async function saveImage(imageData: string, imagePath: string): Promise<void> {
  await saveData(imageData, imagePath, 'binary');
  const image = await jimp.read(imagePath);
  image.resize(COVER_WIDTH, jimp.AUTO)
    .quality(COVER_JPEG_QUALITY);
  await image.writeAsync(imagePath);
}

type Credentials = {
  consumerKey: string;
  consumerSecret: string;
}

type DiscogsClientParams = {
  coversPath: string;
  artistPicturesPath: string;
  userAgent: string;
  credentials: Credentials;
  disabled?: boolean;
  debug?: boolean;
};

export default class DiscogsClient {
  coversPath: string;
  artistPicturesPath: string;
  credentials: Credentials;
  discogs: typeof Client;
  db: Function;
  coversCache: Cache;
  artistsCache: Cache;
  disabled: boolean;
  debug: boolean;
  constructor({
    coversPath,
    artistPicturesPath,
    userAgent,
    credentials,
    disabled = false,
    debug = false
  }: DiscogsClientParams) {
    this.coversPath = coversPath;
    this.artistPicturesPath = artistPicturesPath;
    this.credentials = credentials;
    this.discogs = new Client(userAgent, credentials);
    this.coversCache = new Cache();
    this.artistsCache = new Cache();
    this.disabled = disabled;
    this.debug = debug;
  }

  async getAlbumCover(
    artist: string,
    title: string,
    _id: string
  ): Promise<string> {
    return this._getResourceFromDiscogs({
      _id,
      query: { artist, title },
      resource: 'cover'
    });
  }

  async getAlbumCoverFromURL(_id: string, url = ''): Promise<string> {
    const imagePath = Path.join(this.coversPath, `${_id}.jpg`);
    if (url.startsWith('http')) {
      const db = this.discogs.database();
      const imageData = await db.getImage(url);
      await saveImage(imageData, imagePath);
    } else {
      await fs.copyFile(url, imagePath);
    }
    this.coversCache.set(_id, imagePath);
    return imagePath;
  }

  async getArtistPicture(
    artist: string,
    _id: string
  ): Promise<string> {
    return this._getResourceFromDiscogs({
      _id,
      query: { q: artist },
      resource: 'artist'
    });
  }

  async getArtistPictureFromURL(_id: string, url = ''): Promise<string> {
    const imagePath = Path.join(this.artistPicturesPath, `${_id}.jpg`);
    if (url.startsWith('http')) {
      const db = this.discogs.database();
      const imageData = await db.getImage(url);
      await saveImage(imageData, imagePath);
    } else {
      await fs.copyFile(url, imagePath);
    }
    this.artistsCache.set(_id, imagePath);
    return imagePath;
  }

  async _getResourceFromDiscogs({
    _id,
    resource,
    query
  }: {
    resource: 'artist' | 'cover';
    _id: string;
    query: object;
  }): Promise<string> {
    if (this.disabled) {
      return '';
    }
    const { cache, basePath, type } = ((): {
      cache: Cache;
      basePath: string;
      type: string;
    } => {
      switch (resource) {
        case 'artist':
          return {
            cache: this.artistsCache,
            basePath: this.artistPicturesPath,
            type: 'artist'
          };
        case 'cover':
        return {
          cache: this.coversCache,
          basePath: this.coversPath,
          type: 'master'
        };
      }
    })();

    const { entry, fromCache } = cache.get(_id);
    if (!entry && fromCache) {
      return null;
    }
    if (entry) {
      return entry;
    }

    const imagePath = Path.join(basePath, `${_id}.jpg`);
    let imageFound = false;
    try {
      imageFound = fs.existsSync(imagePath);
    } catch(_error) {
      imageFound = false;
    }
    if (imageFound) {
      cache.set(_id, imagePath);
      return imagePath;
    }

    let imageData;
    try {
      imageData = await this._getImageFromDiscogs({ _id, type, query });
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        log({
          context: LogContext.Discogs,
          level: LogLevel.Warning,
          message: `No image found for [${_id}]`
        });
        this.coversCache.setNotFound(_id);
        return null;
      }
    }
    if (!imageData) {
      this.coversCache.setNotFound(_id);
      return null;
    }
    await saveImage(imageData, imagePath);
    this.coversCache.set(_id, imagePath);
    return imagePath;
  }

  async _getImageFromDiscogs({ _id, query, type }: {
    _id: string;
    query: object;
    type: string;
  }): Promise<string> {
    const db = this.discogs.database();
    const { results } = await db.search({ type, ...query });
    if (results.length === 0) {
      throw new ResourceNotFoundError(`No results for: [${_id}]`);
    }
    const imageData = await db.getImage(results[0].cover_image);
    if (imageData.length === 0) {
      throw new ResourceNotFoundError(`No results for: [${_id}]`);
    }
    return imageData;
  }
}
