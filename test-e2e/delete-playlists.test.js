const path = require('path');
const { getApp } = require('./utils/appUtils');
const { TEN_SECONDS } = require('./utils/appUtils');
const { populateTestDB, TestPlaylists } = require('./utils/databaseUtils');

function mock(app, options) {
  app.electron.ipcRenderer.sendSync('SPECTRON_FAKE_DIALOG/SEND', options);
}

describe('Delete playlists', () => {
  let app, menuAddon, contextMenuAddon;
  beforeEach(async () => {
    const menuApp = await getApp({
      args: ['-r', path.join(__dirname, '__mocks__/mock-dialog.js')]
    });
    app = menuApp.app;
    menuAddon = menuApp.menuAddon;
    contextMenuAddon = menuApp.contextMenuAddon;
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('deletes selected playlists', async () => {
    await populateTestDB({
      playlists: TestPlaylists
    });
    await app.start();

    mock(app, [
      {
        method: 'showMessageBox',
        value: {
          response: 0
        }
      }
    ]);

    await app.client.waitUntilWindowLoaded();

    await app.client.click('.app-header .button-playlists');
    await app.client.waitUntil(async () => await app.client.getText('.app-header h1') === 'All Playlists');
    await app.client.keys(['Meta', 'a']);
    menuAddon.clickMenu('Playlist', 'Remove Selected Playlists');
    await app.client.waitUntil(async () =>
      await app.client.getText('.all-playlists-empty-placeholder') === 'No playlists yet'
    );
  }, TEN_SECONDS);
});
