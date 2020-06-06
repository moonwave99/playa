const { getApp, TEN_SECONDS } = require('../utils/appUtils');
const { populateTestDB, TestPlaylists } = require('../utils/databaseUtils');
const { wait } = require('../../test/testUtils');

describe('Onboarding window', () => {
  let app, menuAddon;
  beforeEach(async () => {
    await populateTestDB();
    const menuApp = await getApp({
      args: [],
      state: {
        showOnboarding: true
      }
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

  it('shows the Onboarding window', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.client.waitUntil(async () => await app.client.getWindowCount() === 2);
  });

  it('closes the Onboarding window when Esc is pressed', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.client.waitUntil(async () => await app.client.getWindowCount() === 2);
    await app.client.windowByIndex(1);
    await app.client.waitUntilWindowLoaded();
    await app.client.keys(['Escape']);
    await app.client.windowByIndex(0);
    expect(
      await app.client.getWindowCount()
    ).toBe(1);
  });

  it('should not reopen the Onboarding window once dismissed', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.client.waitUntil(async () => await app.client.getWindowCount() === 2);
    await app.client.windowByIndex(1);
    await app.client.waitUntilWindowLoaded();
    await app.client.keys(['Escape']);
    await app.client.windowByIndex(0);

    await app.restart();
    await wait(TEN_SECONDS / 2);
    expect(
      await app.client.getWindowCount()
    ).toBe(1);
  }, TEN_SECONDS);
});
