const Application = require('spectron').Application;
const electronPath = require('electron');
const path = require('path');
const { populateTestDB } = require('./utils/databaseUtils');
const { TestAlbums, generateAlbum } = require('./utils/musicfileUtils');

function mock(app, options) {
  app.electron.ipcRenderer.sendSync('SPECTRON_FAKE_DIALOG/SEND', options);
}

const TEN_SECONDS = 10000;

describe('Import album into library', () => {
  let app;
  beforeEach(async () => {
    await populateTestDB();
    app = new Application({
      path: electronPath,
      env: { RUNNING_IN_SPECTRON: '1' },
      args: ['-r', path.join(__dirname, '__mocks__/mock-dialog.js'), path.join(__dirname, '..')]
    });
    await app.start();
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('imports an album into database', async () => {
    const { artist, title, year } = TestAlbums[0];
    const albumPath = await generateAlbum(TestAlbums[0]);
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
    await app.client.waitUntil(async() => await app.client.getText('h1') === 'Your Music Library');
    await app.client.click('.library .button-add-album');
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
