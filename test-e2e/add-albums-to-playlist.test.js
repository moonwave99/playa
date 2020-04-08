const path = require('path');
const { getApp } = require('./utils/appUtils');
const { TEN_SECONDS } = require('./utils/appUtils');
const { populateTestDB, TestPlaylists, TestAlbums, TestArtists } = require('./utils/databaseUtils');
const { FileAlbums, generateAlbum } = require('./utils/musicfileUtils');

function mock(app, options) {
  app.electron.ipcRenderer.sendSync('SPECTRON_FAKE_DIALOG/SEND', options);
}

describe('Add albums to playlist', () => {
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

  it('adds selected albums to an existing playlist', async () => {
    await populateTestDB({
      playlists: [TestPlaylists[0]],
      albums: TestAlbums,
      artists: TestArtists
    });
    await app.start();
    await app.client.waitUntilWindowLoaded();
    await app.client.click('.app-header .button-library');
    await app.client.waitUntil(async () => await app.client.getText('.app-header h1') === 'Library');

    // await app.client.keys(['Meta', 'a']);
    await menuAddon.clickMenu('Library', 'Add Selected Albums to Playlist...');
    await app.client.waitForExist('.add-albums-to-playlist');
    await app.client.click(`#add-to-playlist-item-${TestPlaylists[0]._id}`);
    await app.client.waitUntil(
      async () => !await app.client.elements('.add-albums-to-playlist').value
    );
    await app.client.click('.app-header .button-playlists');
    await app.client.waitForExist('.all-playlists');
    await app.client.click(`#playlist-grid-tile-${TestPlaylists[0]._id} .playlist-title`);
    await app.client.waitForExist('.playlist-view');
    await app.client.waitForExist(`#album-${TestAlbums[1]._id}`);
  }, TEN_SECONDS);

  it('adds selected albums to a new playlist', async () => {
    await populateTestDB({
      playlists: [TestPlaylists[0]],
      albums: TestAlbums,
      artists: TestArtists
    });
    await app.start();
    await app.client.waitUntilWindowLoaded();
    await app.client.click('.app-header .button-library');
    await app.client.waitUntil(async () => await app.client.getText('.app-header h1') === 'Library');

    // await app.client.keys(['Meta', 'a']);
    await menuAddon.clickMenu('Library', 'Add Selected Albums to Playlist...');
    await app.client.waitForExist('.add-albums-to-playlist');
    await app.client.click('.new-playlist');
    await app.client.waitUntil(
      async () => !await app.client.elements('.add-albums-to-playlist').value
    );
    await app.client.waitForExist('.playlist-view');
    await app.client.keys('Enter');
    await app.client.waitForExist(`#album-${TestAlbums[1]._id}`);
  }, TEN_SECONDS);
});
