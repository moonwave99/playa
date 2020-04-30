const path = require('path');
const { getApp } = require('../utils/appUtils');
const { TEN_SECONDS } = require('../utils/appUtils');
const { populateTestDB, TestAlbums, TestPlaylists, TestArtists } = require('../utils/databaseUtils');
const { FileAlbums, generateAlbum } = require('../utils/musicfileUtils');

function mock(app, options) {
  app.electron.ipcRenderer.sendSync('SPECTRON_FAKE_DIALOG/SEND', options);
}

describe('Playlist interaction', () => {
  let app, menuAddon, contextMenuAddon;
  beforeEach(async () => {
    const menuApp = await getApp({
      args: ['-r', path.join(process.cwd(), 'e2e/__mocks__/mock-dialog.js')]
    });
    app = menuApp.app;
    menuAddon = menuApp.menuAddon;
    contextMenuAddon = menuApp.contextMenuAddon;
    await populateTestDB({
      playlists: [{
        ...TestPlaylists[0],
        albums: TestAlbums.map(({ _id }) => _id)
      }],
      albums: TestAlbums,
      artists: TestArtists
    });
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('renames current playlist', async () => {
    await app.start();
    await app.client.waitUntilWindowLoaded();

    const { _id, title } = TestPlaylists[0];
    const newTitle = 'New Playlist Title';

    // select playlist
    await app.client.click(`#playlist-list-item-${_id} .playlist-list-item-link`);
    await app.client.waitUntil(
      async () => await app.client.getText('.app-header .heading-main') === title
    );
    await app.client.click('.app-header h1');

    // rename playlist
    await app.client.waitForExist('.app-header-middle-wrapper form');
    await app.client.keys(new Array(title.length).fill('Backspace'));
    await app.client.setValue('.app-header-middle-wrapper form input', newTitle);
    await app.client.keys('Enter');

    // check that title has been updated
    await app.client.waitUntil(
      async () => await app.client.getText('.app-header .heading-main') === newTitle
    );

    // check that sidebar playlist item has been updated
    await app.client.waitUntil(
      async () => await app.client.getText(`#playlist-list-item-${_id} .playlist-list-item-link`) === newTitle
    );

    // check that playlist has been updated in all playlists view
    await app.client.click('.app-header .button-playlists');
    await app.client.waitForExist('.all-playlists');
    await app.client.waitUntil(
      async () => await app.client.getText(`#playlist-grid-tile-${_id}`) === newTitle
    );
  });

  it('removes current playlist', async () => {
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

    const { _id, title } = TestPlaylists[0];

    // select playlist
    await app.client.click(`#playlist-list-item-${_id} .playlist-list-item-link`);
    await app.client.waitUntil(
      async () => await app.client.getText('.app-header .heading-main') === title
    );

    // remove playlist
    menuAddon.clickMenu('Playlist', 'Remove Current Playlist');
    await app.client.waitUntil(
      async () => await app.client.getText('.app-header .heading-main') === 'Playback Queue'
    );

    // check that playlist is not displayed in sidebar
    await app.client.waitUntil(
      async () => {
        const selection = await app.client.elements(`#playlist-list-item-${_id}`);
        return selection.value.length === 0
      }
    );

    // check that playlist is not displayed in all playlists view
    await app.client.click('.app-header .button-playlists');
    await app.client.waitForExist('.all-playlists');
    await app.client.waitUntil(
      async () => {
        const selection = await app.client.elements(`#playlist-grid-tile-${_id}`);
        return selection.value.length === 0
      }
    );
  }, TEN_SECONDS);

  it('removes selected album from current playlist', async () => {
    await app.start();
    await app.client.waitUntilWindowLoaded();

    const { _id, title } = TestPlaylists[0];

    await app.client.click(`#playlist-list-item-${_id} .playlist-list-item-link`);
    await app.client.waitUntil(
      async () => await app.client.getText('.app-header .heading-main') === title
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
    await app.start();
    await app.client.waitUntilWindowLoaded();

    const { _id, title } = TestPlaylists[0];

    await app.client.click(`#playlist-list-item-${_id} .playlist-list-item-link`);
    await app.client.waitUntil(
      async () => await app.client.getText('.app-header .heading-main') === title
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
