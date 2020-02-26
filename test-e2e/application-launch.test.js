const Application = require('spectron').Application;
const electronPath = require('electron');
const path = require('path');

describe('Application launch', function() {
  let app;
  beforeEach(function() {
    app = new Application({
      path: electronPath,
      env: { RUNNING_IN_SPECTRON: '1' },
      args: [path.join(__dirname, '..')]
    });
    return app.start();
  });

  afterEach(function() {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('shows an initial window', async function() {
    const count = await app.client.getWindowCount()
    // window + content webview + devtools webview
    expect(count).toBe(3);
  });
});
