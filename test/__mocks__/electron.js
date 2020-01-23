const { IPC_MESSAGES } = require('../../src/constants');
const {
  IPC_ALBUM_CONTENT_REQUEST,
  IPC_ALBUM_DELETE_LIST_REQUEST
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
        case IPC_ALBUM_DELETE_LIST_REQUEST:
        case IPC_ALBUM_CONTENT_REQUEST:
          return args[0];
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
