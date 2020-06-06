import { app, BrowserWindow, shell, Event } from 'electron';
import { is } from 'electron-util';
import * as Path from 'path';
import * as url from 'url';

import {
  runAsync,
  backupProductionData,
  getUserDataPath,
  installExtensions
} from './lib/utils';
import { parseEnvironment } from './lib/environment';
import log, { LogLevel } from './lib/logger';

import initMenu from './initializers/initMenu';
import initDatabase from './initializers/initDatabase';
import initDiscogsClient from './initializers/initDiscogsClient';
import initWaveform from './initializers/initWaveform';
import initURLHandler from './initializers/initURLHandler';
import initAppState from './initializers/initAppState';
import initDialog from './initializers/initDialog';

import openOnboardingWindow from './lib/onboardingWindow';

import {
  name as APP_NAME,
  version as APP_VERSION
} from '../../package.json';

import { DISCOGS_KEY, DISCOGS_SECRET } from '../../settings/discogs.json';

import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  MIN_WIDTH as minWidth,
  MIN_HEIGHT as minHeight,
  TRAFFIC_LIGHTS_POSITION as trafficLightPosition,
  IS_MACOS,
  IPC_MESSAGES,
  COLORS
} from '../constants';

const {
  IPC_UI_SWIPE
} = IPC_MESSAGES;

const {
  disableDiscogsRequests,
  debug,
  backupProduction,
  environment,
  isRunningInSpectron
} = parseEnvironment(process.env);

const userDataPath = getUserDataPath({
  isRunningInSpectron,
  appName: APP_NAME
});

if (backupProduction) {
  runAsync(
    backupProductionData,
    userDataPath,
    Path.join(process.cwd(), 'backup', APP_NAME)
  );
}

initDialog();
initURLHandler();

runAsync(initDatabase, {
  userDataPath,
  debug,
  environment
});

runAsync(initDiscogsClient, {
  userDataPath,
  appName: APP_NAME,
  appVersion: APP_VERSION,
  discogsKey: DISCOGS_KEY,
  discogsSecret: DISCOGS_SECRET,
  disabled: disableDiscogsRequests,
  debug
});

runAsync(initWaveform, userDataPath);

const appState = initAppState({ userDataPath, environment });
const {
  lastWindowSize,
  lastWindowPosition,
  showOnboarding
} = appState.getState();

let mainWindow: Electron.BrowserWindow;

function createWindow({
  size = [DEFAULT_WIDTH, DEFAULT_HEIGHT],
  position = [0, 0],
  isRunningInSpectron = false,
  backgroundColor = COLORS.BACKGROUND_COLOR
}): BrowserWindow {
  const [width, height] = size;
  const [x, y] = position;
  const mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    minWidth,
    minHeight,
    backgroundColor,
    maximizable: false,
    focusable: true,
    show: false,
    titleBarStyle: 'hidden',
    trafficLightPosition,
    webPreferences: {
      allowRunningInsecureContent: false,
      enableRemoteModule: true,
      nodeIntegration: true,
      nativeWindowOpen: true
    }
  });

  // Open external URLs in default OS browser
  mainWindow.webContents.on('new-window', (event: Event, url: string) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.on('swipe', (_event: Event, direction: string) => {
    mainWindow.webContents.send(IPC_UI_SWIPE, direction);
  });

  initMenu({
    window: mainWindow,
    debug: is.development
  });

  mainWindow.loadURL(
    url.format({
      pathname: Path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  mainWindow.once('ready-to-show', () => {
    if (is.development && !isRunningInSpectron) {
      mainWindow.webContents.toggleDevTools();
    }
    mainWindow.show();
  });

  mainWindow.once('show', () => {
    if (showOnboarding) {
      setTimeout(() => openOnboardingWindow(appState), 1000);
    }
  });

  if (is.development) {
    mainWindow.maximize();
  }

  return mainWindow;
}

log({
  level: LogLevel.Force,
  message: 'App started'
}, {
  environment,
  debug,
  backupProduction,
  disableDiscogsRequests,
  ...appState.getState()
});

app.on('ready', async () => {
  if (is.development) {
    await installExtensions();
  }
  mainWindow = createWindow({
    size: lastWindowSize,
    position: lastWindowPosition,
    isRunningInSpectron
  });
});

app.on('activate', () => {
  if (IS_MACOS && mainWindow === null) {
    mainWindow = createWindow({
      size: lastWindowSize,
      position: lastWindowPosition
    });
  }
});

app.on('will-quit', () => {
  appState.setState({
    lastWindowSize: mainWindow.getSize(),
    lastWindowPosition: mainWindow.getPosition()
  });
  appState.save();
});

app.on('window-all-closed', () => app.quit());
app.allowRendererProcessReuse = true;
