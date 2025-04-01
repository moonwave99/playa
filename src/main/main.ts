import { app, BrowserWindow, shell, screen, protocol, net, dialog, ipcMain as ipc } from 'electron';
import type { IpcMainEvent, OpenDialogSyncOptions } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import registerApi from './api';
import { setupMenu } from './menu/menu';
import { initSettings, getSetting } from './settings';

if (started) {
  app.quit();
}

const createWindow = async () => {
  const { height, width } = screen.getPrimaryDisplay().size;
  const mainWindow = new BrowserWindow({
    height,
    width,
    minWidth: 450,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 10, y: 20 }
  });

  mainWindow.on('swipe', (_, direction) => {
    if (direction === 'left' && mainWindow.webContents.navigationHistory.canGoBack()) {
      mainWindow.webContents.navigationHistory.goBack();
    }
    if (direction === 'right' && mainWindow.webContents.navigationHistory.canGoForward()) {
      mainWindow.webContents.navigationHistory.goForward();
    }
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  ipc.handle('dialog:open', (
    _: IpcMainEvent,
    options: Partial<OpenDialogSyncOptions>
  ) => {
    const path = dialog.showOpenDialogSync(mainWindow, options);
    return path?.at(0);
  });

  await initSettings();
  setupMenu(mainWindow);
  registerApi();
};

app.on('ready', createWindow);
app.on('window-all-closed', () => app.quit());

app.on('activate', () => {
  if (!BrowserWindow.getAllWindows().length) {
    createWindow();
  }
});

app.whenReady().then(() => {
  const COVERS_PATH = getSetting('COVERS_PATH') as string;
  const customProtocol = 'playa-cover';
  protocol.handle(customProtocol, ({ url }) => {
    const { hostname } = new URL(url);
    return net.fetch(`file://${path.join(COVERS_PATH, hostname)}`);
  })
})