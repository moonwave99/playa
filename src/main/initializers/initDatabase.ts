import { ipcMain as ipc } from 'electron';
import * as Path from 'path';
import Database from '../database';
import loadAlbum from '../loadAlbum';
import loadTracklist from '../loadTracklist';
import { Album } from '../../renderer/store/modules/album';
import { IPC_MESSAGES } from '../../constants';

const {
  IPC_PLAYLIST_GET_ALL_REQUEST,
  IPC_PLAYLIST_GET_ALL_RESPONSE,
  IPC_PLAYLIST_SAVE_REQUEST,
  IPC_PLAYLIST_SAVE_RESPONSE,
  IPC_PLAYLIST_DELETE_REQUEST,
  IPC_PLAYLIST_DELETE_RESPONSE,
  IPC_SEARCH_REQUEST,
  IPC_SEARCH_RESPONSE,
  IPC_ALBUM_GET_LIST_REQUEST,
  IPC_ALBUM_GET_LIST_RESPONSE,
  IPC_ALBUM_CONTENT_REQUEST,
  IPC_ALBUM_CONTENT_RESPONSE,
  IPC_TRACK_GET_LIST_REQUEST,
  IPC_TRACK_GET_LIST_RESPONSE,
  IPC_ALBUM_GET_SINGLE_INFO
} = IPC_MESSAGES;

export default function initDatabase(userDataPath: string): void {
  const databasePath = userDataPath + Path.sep + 'databases' + Path.sep;
  const db = {
    album: new Database(databasePath, 'album', true),
    playlist: new Database(databasePath, 'playlist', true),
    track: new Database(databasePath, 'track', true)
  };

  ipc.on(IPC_PLAYLIST_GET_ALL_REQUEST, async (event) => {
    try {
      const results = await db.playlist.findAll();
      event.reply(IPC_PLAYLIST_GET_ALL_RESPONSE, results);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipc.on(IPC_PLAYLIST_SAVE_REQUEST, async (event, playlist) => {
    try {
      const savedPlaylist = await db.playlist.save({
        ...playlist,
        accessed: new Date().toISOString()
      });
      event.reply(IPC_PLAYLIST_SAVE_RESPONSE, savedPlaylist);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipc.on(IPC_PLAYLIST_DELETE_REQUEST, async (event, playlist) => {
    try {
      const deletedPlaylist = await db.playlist.delete(playlist);
      event.reply(IPC_PLAYLIST_DELETE_RESPONSE, deletedPlaylist);
    } catch (error) {
      event.reply('error', error);
    }
  });

  // #TODO configure query structure
  ipc.on(IPC_SEARCH_REQUEST, async (event, query) => {
    try {
      const results = await db.album.find(query, ['artist', 'title']);
      event.reply(IPC_SEARCH_RESPONSE, results, query);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipc.on(IPC_ALBUM_GET_LIST_REQUEST, async (event, ids) => {
    try {
      const results = await db.album.getList(ids);
      event.reply(IPC_ALBUM_GET_LIST_RESPONSE, results);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipc.on(IPC_ALBUM_CONTENT_REQUEST, async (event, album) => {
    try {
      const tracks = await loadAlbum(album.path);
      const savedAlbum = await db.album.save({ ...album, tracks });
      event.reply(IPC_ALBUM_CONTENT_RESPONSE, savedAlbum);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipc.on(IPC_TRACK_GET_LIST_REQUEST, async (event, ids) => {
    try {
      const results = await loadTracklist(ids, db.track);
      event.reply(IPC_TRACK_GET_LIST_RESPONSE, results);
    } catch (error) {
      event.reply('error', error);
    }
  });

  ipc.handle(IPC_ALBUM_GET_SINGLE_INFO, async (_event, ids) => {
    const albums: Album[] = await db.album.getList(ids);
    let tracks = albums[0].tracks || [];
    if (tracks.length === 0) {
      tracks = await loadAlbum(albums[0].path);
    }
    const foundTracks = await loadTracklist(tracks, db.track);
    return {
      album: {
        ...albums[0],
        tracks
      },
      tracks: foundTracks
    };
  });  
}
