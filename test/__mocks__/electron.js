class Menu {
  append() {}
  popup() {}
}

class MenuItem {}

module.exports = {
  ipcRenderer: {
    on: jest.fn(),
    send: jest.fn()
  },
  remote: {
    Menu: Menu,
    MenuItem: MenuItem,
    getCurrentWindow: () => {}
  }
};
