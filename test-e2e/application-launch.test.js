const { getApp, TEN_SECONDS } = require('./utils/appUtils');
const { populateTestDB, TestPlaylists } = require('./utils/databaseUtils');

describe('Application launch', () => {
  let app;
  beforeEach(async () => {
    await populateTestDB({
      playlists: [TestPlaylists[0]]
    });
    app = await getApp();
    return app.start();
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('shows an initial window', async () => {
    const count = await app.client.getWindowCount();
    // window + content webview
    expect(count).toBe(2);
  });

  it('recalls last opened playlist', async () => {
    const title = TestPlaylists[0].title;
    await app.client.waitUntilWindowLoaded();
    await app.client.click('.playlist-list .playlist-list-item');
    await app.client.waitUntil(async() => await app.client.getText('h1') === title);
    // console.log('before', await app.client.getText('h1'))
    await app.restart();
    await app.client.waitUntilWindowLoaded();
    // console.log('after', await app.client.getText('h1'))
    expect(await app.client.getText('h1')).toBe(title);
  }, TEN_SECONDS);
});
