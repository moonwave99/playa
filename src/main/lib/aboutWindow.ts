import { BrowserWindow } from 'electron';
import * as Path from 'path';
import * as url from 'url';

import {
  ABOUT_WINDOW_WIDTH,
  ABOUT_WINDOW_HEIGHT
} from '../../constants';

let aboutWindow: BrowserWindow;

export default function openAboutWindow(): BrowserWindow {
  if (aboutWindow) {
    aboutWindow.focus();
    return aboutWindow;
  }

  aboutWindow = new BrowserWindow({
    width: ABOUT_WINDOW_WIDTH,
    height: ABOUT_WINDOW_HEIGHT,
    center: true,
    resizable: false,
    maximizable: false,
    focusable: true,
    show: false,
    useContentSize: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      allowRunningInsecureContent: false,
      nodeIntegration: true,
      nativeWindowOpen: true
    }
  });

  aboutWindow.once('ready-to-show', () => {
    aboutWindow.show();
  });

  aboutWindow.once('closed', () => {
    aboutWindow = null;
  });

  aboutWindow.setMenu(null);

  aboutWindow.loadURL(
    url.format({
      pathname: Path.join(__dirname, './about.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  return aboutWindow;
}
