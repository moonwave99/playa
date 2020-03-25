const path = require('path');
const { getApp } = require('./utils/appUtils');
const { TEN_SECONDS } = require('./utils/appUtils');
const { populateTestDB, TestArtists, TestAlbums } = require('./utils/databaseUtils');

describe('Edit artist information', () => {
  let app, menuAddon;
  beforeEach(async () => {
    const menuApp = await getApp();
    app = menuApp.app;
    menuAddon = menuApp.menuAddon;
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('edits artist name', async () => {
    await populateTestDB({
      artists: TestArtists,
      albums: TestAlbums
    });
    await app.start();

    await app.client.waitUntilWindowLoaded();
    await app.client.click('.app-header .button-library');
    await app.client.waitUntil(async () => await app.client.getText('.app-header h1') === 'Library');

    await app.client.click(`#album-grid-tile-${TestArtists[0]._id} .album-artist`);

    await app.client.waitUntil(
      async () => await app.client.getText('.app-header h1 .heading-main') === TestArtists[0].name
    );

    await menuAddon.clickMenu('Library', 'Rename Current Artist');

    await app.client.waitUntil(
      async () => {
        return await app.client.getValue('.app-header-middle-wrapper input[name="title"]') === TestArtists[0].name
      }
    );

    const newName = 'Pino Daniele';
    await app.client.keys(new Array(TestArtists[0].name.length).fill('Backspace'));
    await app.client.setValue('.app-header-middle-wrapper form input', newName);
    await app.client.keys('Enter');

    await app.client.waitUntil(
      async () => await app.client.getText('.app-header h1 .heading-main') === newName
    );

    await app.client.click('.app-header .button-library');
    await app.client.waitUntil(async () => await app.client.getText('.app-header h1') === 'Library');

    await app.client.waitUntil(
      async () => await app.client.getText(`#album-grid-tile-${TestArtists[0]._id} .album-artist`) === newName
    );
  }, TEN_SECONDS);
});
