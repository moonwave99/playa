const path = require('path');
const { getApp } = require('./utils/appUtils');
const { TEN_SECONDS } = require('./utils/appUtils');
const { populateTestDB, TestArtists } = require('./utils/databaseUtils');
const { FileAlbums, generateAlbum } = require('./utils/musicfileUtils');

function mock(app, options) {
  app.electron.ipcRenderer.sendSync('SPECTRON_FAKE_DIALOG/SEND', options);
}

describe('Import album into library', () => {
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

  it('imports an album', async () => {
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

    // no need to fill artist value, since inferred from ID3 tags
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

    // check that artist is now inside ArtistListView
    await app.client.click(`.library .alphabet .letter-${artist.toLowerCase().charAt(0)}`);
    await app.client.waitUntil(async () => {
      const isArtistRendered =
        await app.client.getText(`#artist-${artist} .artist-name`) === artist;
      return isArtistRendered;
    });

    // check that single artist page contains album
    await app.client.click(`#artist-${artist}`);
    await app.client.waitUntil(async () => {
      const renderedTitle = await app.client.getText('#album-grid-tile-1 .album-title');
      const renderedYear = await app.client.getText('#album-grid-tile-1 .album-year');
      return renderedTitle === title
        && +renderedYear === year;
    });
  }, TEN_SECONDS);

  it('imports an album of an existing artist', async () => {
    await populateTestDB({
      artists: [TestArtists[0]]
    });
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

    // check that artist is now inside ArtistListView
    await app.client.click(`.library .alphabet .letter-${artist.toLowerCase().charAt(0)}`);
    await app.client.waitUntil(async () => {
      const isArtistRendered =
        await app.client.getText(`#artist-${artist} .artist-name`) === artist;
      return isArtistRendered;
    });

    // check that single artist page contains album
    await app.client.click(`#artist-${artist}`);
    await app.client.waitUntil(async () => {
      const renderedTitle = await app.client.getText('#album-grid-tile-1 .album-title');
      const renderedYear = await app.client.getText('#album-grid-tile-1 .album-year');
      return renderedTitle === title
        && +renderedYear === year;
    });
  }, TEN_SECONDS);
});
