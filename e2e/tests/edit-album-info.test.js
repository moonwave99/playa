const path = require('path');
const { getApp } = require('../utils/appUtils');
const { TEN_SECONDS } = require('../utils/appUtils');
const { populateTestDB, TestArtists } = require('../utils/databaseUtils');
const { FileAlbums, generateAlbum } = require('../utils/musicfileUtils');

function mock(app, options) {
  app.electron.ipcRenderer.sendSync('SPECTRON_FAKE_DIALOG/SEND', options);
}

describe('Edit album information', () => {
  let app, menuAddon, contextMenuAddon;
  beforeEach(async () => {
    const menuApp = await getApp({
      args: ['-r', path.join(process.cwd(), 'e2e/__mocks__/mock-dialog.js')]
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

  it('edits album info', async () => {
    await populateTestDB();
    await app.start();
    const { artist, title, year } = FileAlbums[0];
    const { path: albumPath, tracks } = await generateAlbum(FileAlbums[0]);
    mock(app, [
      {
        method: 'showOpenDialog',
        value: {
          filePaths: [albumPath]
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
    await app.client.elements('.import-view #year').setValue(year);
    await app.client.click('.import-view button[type="submit"]');

    // Check album is inside recent albums grid
    await app.client.waitUntil(async () => {
      const renderedTitle = await app.client.getText('.album-title');
      const renderedArtist = await app.client.getText('.album-artist');
      const renderedYear = await app.client.getText('.album-year');
      return renderedTitle === title
        && renderedArtist === artist
        && +renderedYear === year;
    });

    // select album
    await app.client.click('.album-cover');
    await menuAddon.clickMenu('Library', 'Edit Selected Album');

    const newData = {
      title: 'Nowhere',
      artist: 'Ride',
      year: 1999
    };

    // Fill form
    await app.client.waitUntil(async () =>
      await app.client.getText('.edit-album .folder-name') === albumPath
    );
    await app.client.elements('.edit-album #artist')
      .setValue(new Array(artist.length).fill('Backspace'))
    await app.client.elements('.edit-album #artist').setValue(newData.artist);

    await app.client.elements('.edit-album #title')
      .setValue(new Array(title.length).fill('Backspace'))
    await app.client.elements('.edit-album #title').setValue(newData.title);

    await app.client.elements('.edit-album #year')
      .setValue(new Array(4).fill('Backspace'))
    await app.client.elements('.edit-album #year').setValue(newData.year);

    await app.client.click('.edit-album button[type="submit"]');

    // check album was updated
    await app.client.waitUntil(async () => {
      const renderedTitle = await app.client.getText('.album-title');
      const renderedArtist = await app.client.getText('.album-artist');
      const renderedYear = await app.client.getText('.album-year');
      return renderedTitle === newData.title
        && renderedArtist === newData.artist
        && +renderedYear === newData.year;
    });
  }, TEN_SECONDS);
});
