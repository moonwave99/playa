import Database, { Entity } from './database';
import { Playlist } from '../../renderer/store/modules/playlist';
import { Album } from '../../renderer/store/modules/album';
import { playlists, albums } from '../../../test/testFixtures';
import { DatabaseError } from '../../errors';
import PouchDB from 'pouchdb';

describe('database', () => {
  describe('constructor', () => {
    it('should replicate db if debug === true', () => {
      new Database({
        path: '/path/to/db',
        name: 'true',
        debug: true
      });
      expect(PouchDB.replicate).toHaveBeenCalled();
    });
  });
  describe('get', () => {
    const db = new Database({
      path: '/path/to/db',
      name: 'album'
    });
    it('should return document by given id', async () => {
      const result = await db.get<Album>('1');
      expect(result).toEqual(albums[0]);
    });
    it('should return an empty object if document is not found', async () => {
      const result = await db.get<Album>('666');
      expect(result).toEqual({});
    });
  });

  describe('findAll', () => {
    const db = new Database({
      path: '/path/to/db',
      name: 'album'
    });
    it('should return all documents by given type', async () => {
      const results = await db.findAll<Album>();
      expect(results).toEqual(albums);
    });
  });

  describe('find', () => {
    const db = new Database({
      path: '/path/to/db',
      name: 'album'
    });
    it('should return documents by given selector', async () => {
      const results = await db.find<Album>({ artist: 'Slowdive' });
      expect(results).toEqual([albums[0]]);
    });
  });

  describe('search', () => {
    const db = new Database({
      path: '/path/to/db',
      name: 'album'
    });
    it('should return documents by given query', async () => {
      const results = await db.search<Album>('Valentine', ['artist']);
      expect(results).toEqual([albums[1]]);
    });
  });

  describe('getList', () => {
    const db = new Database({
      path: '/path/to/db',
      name: 'album'
    });
    it('should return documents in a set of ids', async () => {
      const results = await db.getList<Album>(['2']);
      expect(results).toEqual([albums[1]]);
    });
  });

  describe('getLatest', () => {
    const db = new Database({
      path: '/path/to/db',
      name: 'playlist'
    });
    it('should get latest docs sorted asc by given datefield', async () => {
      const results = await db.getLatest({
        dateFrom: new Date('2020-01-01').toISOString()
      });
      expect(results.length).toBe(playlists.length);
      expect(results[0]).toBe(playlists[1]);
      expect(results[1]).toBe(playlists[0]);
    });
    it('should order results by given order', async () => {
      const results = await db.getLatest({
        dateFrom: new Date('2020-01-01').toISOString(),
        order: 'desc'
      });
      expect(results.length).toBe(playlists.length);
      expect(results[0]).toBe(playlists[0]);
      expect(results[1]).toBe(playlists[1]);
    });
    it('should limit results by given limit', async () => {
      const limit = 1;
      const results = await db.getLatest({
        dateFrom: new Date('2020-01-01').toISOString(),
        limit
      });
      expect(results.length).toBe(limit);
    });
  });

  describe('save', () => {
    const db = new Database({
      path: '/path/to/db',
      name: 'playlist'
    });
    it('should persist given document', async () => {
      const updatedPlaylist = await db.save({
        ...playlists[0],
        title: 'new title'
      } as Entity);
      expect(updatedPlaylist).toEqual({
        ...playlists[0],
        title: 'new title',
        _rev: '0'
      });
    });

    it('should give a new rev to already existing document', async () => {
      const updatedPlaylist = await db.save({
        ...playlists[0],
        title: 'new title'
      } as Entity);

      const { _rev: rev } = updatedPlaylist;

      const reUpdatedPlaylist = await db.save({
        ...updatedPlaylist,
        title: 'newest title'
      } as Entity) as Playlist;

      expect(reUpdatedPlaylist.title).toBe('newest title');
      expect(reUpdatedPlaylist._rev).not.toBe(rev);
    });

    it('should throw a DatabaseError if there are problems', async () => {
      try {
        await db.save({
          ...playlists[1],
          title: 'new title'
        } as Entity);
      } catch(error) {
        expect(error instanceof DatabaseError).toBe(true);
      }
    });
  });

  describe('delete', () => {
    const db = new Database({
      path: '/path/to/db',
      name: 'playlist'
    });
    it('should delete given document', async () => {
      await db.delete({
        ...playlists[0],
        title: 'new title'
      } as Entity);
      const foundPlaylist = await db.get<Playlist>(playlists[0]._id);
      expect(foundPlaylist._id).toBe(undefined);
    });

    it('should throw a DatabaseError if there are problems', async () => {
      try {
        await db.delete({
          ...playlists[1],
        } as Entity);
      } catch(error) {
        expect(error instanceof DatabaseError).toBe(true);
      }
    });
  });

  describe('saveBulk', () => {
    const db = new Database({
      path: '/path/to/db',
      name: 'playlist'
    });
    it('should update documents in bulk', async () => {
      await db.saveBulk([
        {
          ...playlists[0],
          title: 'New Playlist 3'
        },
        {
          ...playlists[1],
          title: 'New Playlist 4'
        }
      ]);
      const updatedPlaylists = await db.findAll<Playlist>();
      expect(updatedPlaylists[0].title).toBe('New Playlist 3');
      expect(updatedPlaylists[1].title).toBe('New Playlist 4');
    });
  });

  describe('deleteBulk', () => {
    const db = new Database({
      path: '/path/to/db',
      name: 'playlist'
    });
    it('should delete documents in bulk', async () => {
      await db.deleteBulk(playlists);
      const updatedPlaylists = await db.findAll<Playlist>();
      expect(updatedPlaylists.length).toBe(0);
    });
  });

  describe('removeBulk', () => {
    const db = new Database({
      path: '/path/to/db',
      name: 'playlist'
    });
    it('should remove documents in bulk', async () => {
      await db.removeBulk(playlists);
      const updatedPlaylists = await db.findAll<Playlist>();
      expect(updatedPlaylists.length).toBe(0);
    });
  });
});
