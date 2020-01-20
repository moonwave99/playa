import { app } from 'electron';
import { is } from 'electron-util';
import { name as APP_NAME } from '../../package.json';

export default function getUserDataPath(): string {
  let userDataPath = app.getPath('userData');
  if (is.development) {
    userDataPath = userDataPath.replace('Electron', APP_NAME);
  }
  return userDataPath;
}
