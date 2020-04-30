const { getApp } = require('../utils/appUtils');
const { populateTestDB, TestPlaylists } = require('../utils/databaseUtils');

describe('About window', () => {
  let app, menuAddon;
  beforeEach(async () => {
    await populateTestDB();
    const menuApp = await getApp();
    app = menuApp.app;
    menuAddon = menuApp.menuAddon;
    return app.start();
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('shows the About window', async () => {
    await app.client.waitUntilWindowLoaded();
    await menuAddon.clickMenu('Playa', 'About Playa');
    expect(
      await app.client.getWindowCount()
    ).toBe(3);
  });

  it('closes the About window when Esc is pressed', async () => {
    await app.client.waitUntilWindowLoaded();
    await menuAddon.clickMenu('Playa', 'About Playa');
    expect(
      await app.client.getWindowCount()
    ).toBe(3);
    await app.client.windowByIndex(2);
    await app.client.waitUntilWindowLoaded();
    await app.client.keys(['Escape']);
    await app.client.windowByIndex(1);
    expect(
      await app.client.getWindowCount()
    ).toBe(2);
  });
});
