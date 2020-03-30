const path = require('path');
const { getApp } = require('./utils/appUtils');
const { TEN_SECONDS } = require('./utils/appUtils');
const { populateTestDB, TestAlbums, TestPlaylists, TestArtists } = require('./utils/databaseUtils');
const { FileAlbums, generateAlbum } = require('./utils/musicfileUtils');

function mock(app, options) {
  app.electron.ipcRenderer.sendSync('SPECTRON_FAKE_DIALOG/SEND', options);
}

describe('Remove albums from playlist', () => {
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

  it('removes selected album from current playlist', async () => {
    await populateTestDB({
      playlists: [{
        ...TestPlaylists[0],
        albums: TestAlbums.map(({ _id }) => _id)
      }],
      albums: TestAlbums,
      artists: TestArtists
    });
    await app.start();

    await app.client.click(`#playlist-list-item-${TestPlaylists[0]._id}`);
    await app.client.waitUntil(
      async () => await app.client.getText('.app-header .heading-main') === TestPlaylists[0].title
    );

    // select second album
    await app.client.keys('ArrowDown');
    await app.client.waitUntil(
      async () => {
        const selection = await app.client.elements('#album-2.selected');
        return selection.value.length === 1
      }
    );

    // delete it
    await app.client.keys('Backspace');
    await app.client.waitUntil(
      async () => !await app.client.elements('#album-2').value
    );

    // first album should be selected
    await app.client.waitUntil(
      async () => {
        const selection = await app.client.elements('#album-1.selected');
        return selection.value.length === 1
      }
    );
  }, TEN_SECONDS);

  it('removes all albums from current playlist', async () => {
    await populateTestDB({
      playlists: [{
        ...TestPlaylists[0],
        albums: TestAlbums.map(({ _id }) => _id)
      }],
      albums: TestAlbums,
      artists: TestArtists
    });
    await app.start();

    await app.client.click(`#playlist-list-item-${TestPlaylists[0]._id}`);
    await app.client.waitUntil(
      async () => await app.client.getText('.app-header .heading-main') === TestPlaylists[0].title
    );

    // select all albums
    await app.client.keys(['Meta', 'a']);
    await app.client.waitUntil(
      async () => {
        const selection = await app.client.elements('.selected');
        return selection.value.length === TestAlbums.length
      }
    );

    // remove them via app menu
    menuAddon.clickMenu('Playlist', 'Remove Selected Albums from Playlist');
    await app.client.waitForExist('.playlist-empty-placeholder');

  }, TEN_SECONDS);
});
