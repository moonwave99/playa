import * as Path from 'path';
import * as fs from 'fs-extra';
import { app } from 'electron';
import { is } from 'electron-util';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import log, { LogContext, LogLevel } from './logger';

type FunctionParams = Array<string|number|symbol|object|Function>;

export const runAsync = (f: Function, ...args: FunctionParams): Promise<void> => (
  async (): Promise<void> => await f(...args)
)();

export async function backupProductionData(
  userDataPath: string,
  backupPath: string
): Promise<void> {
  try {
    log({
      context: LogContext.Global,
      message: 'Backing up production data'
    });
    await fs.copy(userDataPath, backupPath, { overwrite: true });
  } catch (error) {
    log({
      context: LogContext.Global,
      level: LogLevel.Error,
      message: 'Error backing up production data'
    });
  }
}

export function getUserDataPath({
  isRunningInSpectron = false,
  appName
}: {
  isRunningInSpectron: boolean;
  appName: string;
}): string {
  let userDataPath = app.getPath('userData');
  if (isRunningInSpectron) {
    userDataPath = Path.join(process.cwd(), '.spectron');
  }
  if (is.development) {
    userDataPath = userDataPath.replace('Electron', appName);
  }
  return userDataPath;
}

export async function installExtensions(): Promise<void> {
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
