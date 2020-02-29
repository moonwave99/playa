---
title: End to End Testing
slug: february-week-four
date: 2020-02-29T00:00:00.000Z
published: true
---
This week I focused mostly on **end to end testing** (_e2e_ from now on). I am fairly new to e2e, as I usually never adventures myself outside of the green pastures of unit and integration. Electron is a fairly new technology and a lot of practices are yet to settle as mature. My research prompted me with the choice between [testcafe][testcafe] and [spectron][spectron]. I gave the in-house solution a try first.

First I set up a `npm` command in `package.json` like this:

```javascript
{
  ...
	"scripts": {
    ...
		"test:e2e": "jest --config jest.config.e2e.js"
	},
  ...
}
```

Where the `jest.config.e2e.js` configuration files contains:

```javascript
module.exports = {
  roots: [
    "<rootDir>/test-e2e"
  ],
  testMatch: [
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  }
}
```

Test suite runs with `$ yarn/npm run test:e2e`.

## Run tests in isolation: the data problem

In unit tests it is good practice to mock intermediate layers, as you have to just test the [interface contract][design-by-contract], e.g. if you are testing a library that makes calls to an external HTTP API, you want to ensure that you get some data back and your parse it properly.

Same applies for databases. But in an e2e environment, you want to test your app against a **real database instance**, to be certain that every layer of the application harmoniously works in the real life scenario.

The first problem I encountered, was to be able to connect to a database at all in the Spectron environment. In order to provide you testing methods, it runs your Electron app against a [WebDriver.IO][webdriver] instance, whose `userData` path is buried somewhere inside `/var`. Definitely not the one I expect to retrieve data from, usually `~/Library/Application Support/$AppName`.

Luckily, there is an easy way to infere if the app is running in test mode, i.e. from an **environment variable**:

```javascript
const Application = require('spectron').Application;

const app = new Application({
  ...
  env: { RUNNING_IN_SPECTRON: '1' },
  ...
});
```

I updated `/src/main/lib/getUserDataPath.ts` accordingly:

```javascript
import * as Path from 'path';
import { app } from 'electron';
import { is } from 'electron-util';
import { name as APP_NAME } from '../../../package.json';

export default function getUserDataPath(): string {
  let userDataPath = app.getPath('userData');
  if (process.env.RUNNING_IN_SPECTRON) {
    userDataPath = Path.join(process.cwd(), '.spectron');
  }
  if (is.development) {
    userDataPath = userDataPath.replace('Electron', APP_NAME);
  }
  return userDataPath;
}
```

Now I can store all the temp data in the `.spectron` folder!

This is how I populate the database before each test: I simply wipe out then the database folder, then add some fresh data to it afterwards.

```javascript
import * as Path from 'path';
import * as fs from 'fs-extra';
import Database from '../src/main/lib/database';

const SPECTRON_BASEPATH = Path.join(process.cwd(), '.spectron');
const DB_PATH = Path.join(SPECTRON_BASEPATH, 'databases');

async function prepareDir(): Promise<void> {
  await fs.remove(SPECTRON_BASEPATH);
  await fs.ensureDir(SPECTRON_BASEPATH);
  await fs.ensureDir(DB_PATH);
}

export async function populateTestDB(): Promise<void> {
  await prepareDir();
  const playlistDB = new Database({
    path: DB_PATH + Path.sep,
    name: 'playlist'
  });

  const now = new Date().toISOString();
  await playlistDB.save({
    _id: '1',
    _rev: null,
    title: 'New Playlist 1',
    created: now,
    accessed: now,
    albums: [] as string[]
  });

  await playlistDB.close();
}

```

## Dipping my feet into the Spectron API

Let's peek at `application-launch.test.js`:

```javascript
const Application = require('spectron').Application;
const electronPath = require('electron');
const path = require('path');
const { populateTestDB } = require('./utils');

const TEN_SECONDS = 10000;

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

  it('recalls last opened playlist', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.client.click('.playlist-list .playlist-list-item');
    await app.client.waitUntil(async() => await app.client.getText('h1') === 'New Playlist 1');
    await app.restart();
    await app.client.waitUntilWindowLoaded();
    expect(await app.client.getText('h1')).toBe('New Playlist 1');
  }, TEN_SECONDS);
});
```

The `afterEach` callback is very important, because if you don't stop the app instances they will hang in the main process, preventing it from ending (think about your CI environment). You will get following error message:

```bash
Jest did not exit one second after the test run has completed.
This usually means that there are asynchronous operations that were not stopped in your tests.
Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
```

The test ensures that the app shows the last opened playlist on subsequent launches. I spent a bit of time figuring out how to run actions on `DOM` elements (i.e. the whole point of automated tests). Most important caveat is that Spectron uses the [legacy Webdriver v4 API][webdriver-v4-api], so `$(selection).click()` and similars won't work.

It took me a while to understand where Spectron exposed `browser` instance: it does in `app.client`. For some reason I could not destructure / assign it to a variable, so I always have to refer it as `app.client` for the moment.

Good, time to run `app.client.click('.playlist-list .playlist-list-item')`! It should load the clicked playlist. Actually this should be a test on its own, but I am aiming at testing just the critical path, and not every single interaction.

How do I check that the playlist was loaded? The `waitUntil` method checks that the app title contains the playlist title. This assumption relies on the fact that:

1. there is just an `<h1>`;
2. the playlist title is known beforehand.

To make the test more pure, one should give an `id` to the header inside the corresponing React component, and keep track of how the database was populated. Food for thought, I can live with the current state of things.

Ok, now I can `restart` the app and check that I am in the `<PlaylistView>` and the title is the one of last opened playlist.

One last gotcha: pass an increased timeout value to `it`, as some operations may last a bit longer on the first run. `TEN_SECONDS` is acceptable, your mileage may vary.

## Final considerations

E2e tests are immensely useful to test paths that are difficult to track for active developers, such as:

- test what happens **after a fresh install**;
- test on **different screen sizes** than the usual one;
- test corner cases in a **deterministic way**.

Thinking and writing them is an ongoing process that just started now, and that is already helping me in providing quality to the application and further understanding of my own code and of the technologies it interacts with.

[testcafe]: https://github.com/DevExpress/testcafe-browser-provider-electron
[spectron]: https://github.com/electron-userland/spectron
[design-by-contract]: https://en.wikipedia.org/wiki/Design_by_contract
[webdriver]: https://webdriver.io/
[webdriver-v4-api]: http://v4.webdriver.io/api.html
