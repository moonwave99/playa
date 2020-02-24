const fixtures = require('../testFixtures');
const { toObj } = require('../../src/renderer/utils/storeUtils');
const { IPC_MESSAGES } = require('../../src/constants');

const {
  IPC_PLAYLIST_GET_ALL_REQUEST,
  IPC_COVER_GET_REQUEST,
  IPC_COVER_GET_FROM_URL_REQUEST,
  IPC_SEARCH_REQUEST,
  IPC_PLAYLIST_SAVE_REQUEST,
  IPC_PLAYLIST_DELETE_REQUEST,
  IPC_PLAYLIST_SAVE_LIST_REQUEST,
  IPC_ALBUM_GET_LIST_REQUEST,
  IPC_ALBUM_CONTENT_REQUEST,
  IPC_ALBUM_GET_SINGLE_INFO,
  IPC_ALBUM_DELETE_LIST_REQUEST,
  IPC_TRACK_GET_LIST_REQUEST,
  IPC_DIALOG_SHOW_MESSAGE
} = IPC_MESSAGES;

class MenuItem {
  constructor(params){
    Object.entries(params)
      .map(([key, value]) => this[key] = value);
  }
}

class Menu {
  constructor(){
    this.items = [];
  }
  append(item) {
    this.items.push(item);
  }
  popup() {}
}

module.exports = {
  ipcRenderer: {
    on: jest.fn(),
    send: jest.fn(),
    invoke: (message, ...args) => {
      switch (message) {
        case IPC_DIALOG_SHOW_MESSAGE:
          return { response: 0 };
        case IPC_PLAYLIST_GET_ALL_REQUEST:
          return fixtures.playlists;
        case IPC_COVER_GET_REQUEST:
        case IPC_COVER_GET_FROM_URL_REQUEST:
          return '/path/to/cover';
        case IPC_PLAYLIST_SAVE_REQUEST:
        case IPC_PLAYLIST_DELETE_REQUEST:
          return args[0];
        case IPC_PLAYLIST_SAVE_LIST_REQUEST:
          return args[0].map(({ _id, _rev }) => ({ id: _id, rev: _rev }));
        case IPC_SEARCH_REQUEST:
        case IPC_ALBUM_GET_LIST_REQUEST:
        case IPC_ALBUM_DELETE_LIST_REQUEST:
          return fixtures.albums;
        case IPC_ALBUM_GET_SINGLE_INFO:
          return {
            album: {
              ...fixtures.albums[0],
              tracks: fixtures.tracks.map(({ _id }) => _id)
            },
            tracks: fixtures.tracks
          };
        case IPC_ALBUM_CONTENT_REQUEST:
          const album = args[0];
          const tracks = album._id === '1'
            ? [fixtures.tracks[0], fixtures.tracks[1]]
            : [fixtures.tracks[2], fixtures.tracks[3]];
          return { ...album, tracks: tracks.map(x => x._id) };
        case IPC_TRACK_GET_LIST_REQUEST:
          const tracksMap = toObj(fixtures.tracks);
          return args[0].map(x => tracksMap[x]);
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
