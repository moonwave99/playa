const path = require('path');
const { getApp } = require('./utils/appUtils');
const { TEN_SECONDS } = require('./utils/appUtils');
const { populateTestDB, TestArtists } = require('./utils/databaseUtils');
const { FileAlbums, generateAlbum } = require('./utils/musicfileUtils');

function mock(app, options) {
  app.electron.ipcRenderer.sendSync('SPECTRON_FAKE_DIALOG/SEND', options);
}

describe('Remove albums from library', () => {
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

  it('removes selected album from library', async () => {
    await populateTestDB();
    const { artist, title, year } = FileAlbums[0];
    const { path: albumPath, tracks } = await generateAlbum(FileAlbums[0]);

    await app.start();
    
    mock(app, [
      {
        method: 'showOpenDialog',
        value: {
          filePaths: [albumPath]
        }
      },
      {
        method: 'showMessageBox',
        value: {
          response: 0
        }
      }
    ]);

    await app.client.waitUntilWindowLoaded();

    await app.client.click('.app-header .button-library');
    await app.client.waitUntil(async () => await app.client.getText('.app-header h1') === 'Library');
    await menuAddon.clickMenu('Library', 'Import Music');

    // Fill form
    await app.client.waitUntil(async () =>
      await app.client.getText('.import-view .folder-name') === albumPath
    );
    await app.client.elements('.import-view #title').setValue(title);
    await app.client.elements('.import-view #year').setValue(year);
    await app.client.click('.import-view button[type="submit"]');

    // Check album is inside recent albums grid
    await app.client.waitUntil(async () => {
      const renderedTitle = await app.client.getText('#album-grid-tile-1 .album-title');
      const renderedArtist = await app.client.getText('#album-grid-tile-1 .album-artist');
      const renderedYear = await app.client.getText('#album-grid-tile-1 .album-year');
      return renderedTitle === title
        && renderedArtist === artist
        && +renderedYear === year;
    });

    await app.client.click('#album-grid-tile-1 .album-cover');
    await app.client.keys(['Backspace']);
    await app.client.waitUntil(async () =>
      await app.client.getText('.library-latest-albums-empty-placeholder') === 'Library is empty.'
    );
  }, TEN_SECONDS);
});
