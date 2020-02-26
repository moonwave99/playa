const Application = require('spectron').Application;
const electronPath = require('electron');
const path = require('path');
const { populateTestDB } = require('./utils');

describe('Application launch', () => {
  let app;
  beforeEach(async () => {
    await populateTestDB();
    app = new Application({
      path: electronPath,
      env: { RUNNING_IN_SPECTRON: '1' },
      args: [path.join(__dirname, '..')]
    });
    return app.start();
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('shows an initial window', async () => {
    const count = await app.client.getWindowCount()
    // window + content webview + devtools webview
    expect(count).toBe(3);
  });

  it('recalls last opened playlist', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.client.click('.playlist-list .playlist-list-item');
    await app.client.waitUntil(async() => await app.client.getText('h1') === 'New Playlist 1');
    await app.restart();
    await app.client.waitUntilWindowLoaded();
    expect(await app.client.getText('h1')).toBe('New Playlist 1');
  });
});
