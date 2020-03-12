const path = require('path');
const { getApp, TEN_SECONDS } = require('./utils/appUtils');
const { populateTestDB } = require('./utils/databaseUtils');
const { FileAlbums, generateAlbum } = require('./utils/musicfileUtils');

function mock(app, options) {
  app.electron.ipcRenderer.sendSync('SPECTRON_FAKE_DIALOG/SEND', options);
}

describe('Import album into library', () => {
  let app;
  beforeEach(async () => {
    await populateTestDB();
    app = await getApp({
      args: ['-r', path.join(__dirname, '__mocks__/mock-dialog.js')]
    });
    await app.start();
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('imports an album into database', async () => {
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
    await app.client.click('.sidebar .button-library');
    await app.client.waitUntil(async() => await app.client.getText('.app-header h1') === 'Library');
    await app.client.click('.app-header .button-add-album');
    await app.client.waitUntil(async() =>
      await app.client.getText('.import-view .folder-name') === albumPath
    );
    await app.client.elements('.import-view #title').setValue(title);
    await app.client.elements('.import-view #year').setValue(year);
    await app.client.click('.import-view button[type="submit"]');

    await app.client.waitUntil(async() =>
      await app.client
        .elements('.album-grid-tile figure')
        .getAttribute('title') === `[1] ${artist} - ${title}`
    );
  }, TEN_SECONDS);
});
