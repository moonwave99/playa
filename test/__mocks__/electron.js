const fixtures = require('../fixtures');
const { IPC_MESSAGES } = require('../../src/constants');
const {
  IPC_PLAYLIST_GET_ALL_REQUEST,
  IPC_COVER_GET_REQUEST,
  IPC_SEARCH_REQUEST,
  IPC_PLAYLIST_SAVE_REQUEST,
  IPC_PLAYLIST_DELETE_REQUEST,
  IPC_ALBUM_GET_LIST_REQUEST,
  IPC_ALBUM_CONTENT_REQUEST,
  IPC_ALBUM_GET_SINGLE_INFO,
  IPC_ALBUM_DELETE_LIST_REQUEST,
  IPC_TRACK_GET_LIST_REQUEST
} = IPC_MESSAGES;

class Menu {
  append() {}
  popup() {}
}

class MenuItem {}

module.exports = {
  ipcRenderer: {
    on: jest.fn(),
    send: jest.fn(),
    invoke: (message, ...args) => {
      switch (message) {
        case IPC_PLAYLIST_GET_ALL_REQUEST:
          return fixtures.playlists;
        case IPC_COVER_GET_REQUEST:
          return '/path/to/cover';
        case IPC_PLAYLIST_SAVE_REQUEST:
        case IPC_PLAYLIST_DELETE_REQUEST:
          return fixtures.playlists[0];
        case IPC_SEARCH_REQUEST:
        case IPC_ALBUM_GET_LIST_REQUEST:
        case IPC_ALBUM_DELETE_LIST_REQUEST:
          return fixtures.albums;
        case IPC_ALBUM_GET_SINGLE_INFO:
          return {
            album: fixtures.albums[0],
            tracks: fixtures.tracks
          };
        case IPC_ALBUM_CONTENT_REQUEST:
          return { ...args[0], tracks: fixtures.tracks.map(x => x._id) };
        case IPC_TRACK_GET_LIST_REQUEST:
          return fixtures.tracks;
        default:
          return;
      }
    }
  },
  remote: {
    Menu: Menu,
    MenuItem: MenuItem,
    getCurrentWindow: () => {}
  }
};
