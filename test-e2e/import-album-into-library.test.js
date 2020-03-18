const path = require('path');
const { getAppWithMenuInteraction } = require('./utils/appUtils');
const { TEN_SECONDS } = require('./utils/appUtils');
const { populateTestDB } = require('./utils/databaseUtils');
const { FileAlbums, generateAlbum } = require('./utils/musicfileUtils');

function mock(app, options) {
  app.electron.ipcRenderer.sendSync('SPECTRON_FAKE_DIALOG/SEND', options);
}

describe('Import album into library', () => {
  let app, menuAddon;
  beforeEach(async () => {
    await populateTestDB();
    const menuApp = await getAppWithMenuInteraction({
      args: ['-r', path.join(__dirname, '__mocks__/mock-dialog.js')]
    });
    app = menuApp.app;
    menuAddon = menuApp.menuAddon;
    return app.start();
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
    await app.client.click('.app-header .button-library');
    await app.client.waitUntil(async() => await app.client.getText('.app-header h1') === 'Library');
    await menuAddon.clickMenu('Library', 'Import Music');

    await app.client.waitUntil(async() =>
      await app.client.getText('.import-view .folder-name') === albumPath
    );
    await app.client.elements('.import-view #artist').setValue(artist);
    await app.client.elements('.import-view #title').setValue(title);
    await app.client.elements('.import-view #year').setValue(year);
    await app.client.click('.import-view button[type="submit"]');

    await app.client.waitUntil(async() => {
      const renderedTitle = await app.client.getText('.album-grid-tile .album-title');
      const renderedArtist = await app.client.getText('.album-grid-tile .album-artist');
      const renderedYear = await app.client.getText('.album-grid-tile .album-year');
      return renderedTitle === title
        && renderedArtist === artist
        && +renderedYear === year;
    });

    await app.client.click(`.library .alphabet .letter-${artist.toLowerCase().charAt(0)}`);
    await app.client.waitUntil(async() => {
      const isArtistRendered =
        await app.client.getText('.artist-list .artist-list-item .artist-name') === artist;
      const isReleaseCountRendered =
        await app.client.getText('.artist-list .artist-list-item .release-count') === '1';
      return isArtistRendered && isReleaseCountRendered;
    });
  }, TEN_SECONDS);
});
