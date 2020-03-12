import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { app, BrowserWindow, shell, Event } from 'electron';
import { is } from 'electron-util';
import * as Path from 'path';
import * as url from 'url';
import log, { LogContext, LogLevel } from './lib/logger';
import getUserDataPath from './lib/getUserDataPath';

import initMenu from './initializers/initMenu';
import initDatabase from './initializers/initDatabase';
import initDiscogsClient from './initializers/initDiscogsClient';
import initWaveform from './initializers/initWaveform';
import initURLHandler from './initializers/initURLHandler';
import initAppState from './initializers/initAppState';
import initDialog from './initializers/initDialog';

import { name as APP_NAME, version as APP_VERSION } from '../../package.json';
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

let mainWindow: Electron.BrowserWindow;

function createWindow({
  size = [DEFAULT_WIDTH, DEFAULT_HEIGHT],
  position = [0, 0],
  isRunningInSpectron = false,
  backgroundColor = COLORS.BACKGROUND_COLOR
}): void {
  const [width, height] = size;
  const [x, y] = position;
  mainWindow = new BrowserWindow({
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
    mainWindow.webContents.send(IPC_MESSAGES.IPC_UI_SWIPE, direction);
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

  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (is.development) {
    mainWindow.maximize();
  }

  if (is.development && !isRunningInSpectron) {
    mainWindow.webContents.toggleDevTools();
  }
}

async function installExtensions(): Promise<void> {
  try {
    await installExtension(REACT_DEVELOPER_TOOLS);
    log({
      context: LogContext.Global,
      message: 'Installed React DevTools'
    });
  } catch(error) {
    log({
      context: LogContext.Global,
      level: LogLevel.Error,
      message: 'Error installing React DevTools'
    }, error);
  }
}

export enum Environment {
  prod,
  dev,
  fresh
}

function getEnvironment(env = 'prod'): Environment {
  switch (env) {
    case 'prod':
      return Environment.prod;
    case 'dev':
      return Environment.dev;
    case 'fresh':
      return Environment.fresh;
    default:
      throw new Error(`Environment not supported: ${env}`);
  }
}

const userDataPath = getUserDataPath();
const disableDiscogsRequests = process.env.DISABLE_DISCOGS_REQUESTS === 'true';
const debug = process.env.DEBUG === 'true';
const environment = getEnvironment(process.env.ENV);
const isRunningInSpectron = !!process.env.RUNNING_IN_SPECTRON;

initDialog();
(async (): Promise<void> => await initDatabase({
  userDataPath,
  debug,
  environment
}))();
initURLHandler();
initDiscogsClient({
  userDataPath,
  appName: APP_NAME,
  appVersion: APP_VERSION,
  discogsKey: DISCOGS_KEY,
  discogsSecret: DISCOGS_SECRET,
  disabled: disableDiscogsRequests,
  debug
});

initWaveform(userDataPath);

const appState = initAppState({ userDataPath, environment });
const { lastWindowSize, lastWindowPosition } = appState.getState();

app.on('ready', async () => {
  await installExtensions();
  createWindow({
    size: lastWindowSize,
    position: lastWindowPosition,
    isRunningInSpectron
  });
});

app.on('activate', () => {
  if (IS_MACOS && mainWindow === null) {
    createWindow({
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
