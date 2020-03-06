const electronPath = require('electron');
import menuAddon, { SpectronMenuAddon } from 'spectron-menu-addon';
import * as Path from 'path';
import * as fs from 'fs-extra';
import { Application } from 'spectron';

export const SPECTRON_BASEPATH = Path.join(process.cwd(), '.spectron');
export const TEN_SECONDS = 10000;

type GetAppParams = {
  args: string[]
};

export async function getAppWithMenuInteraction({
  args = []
}: GetAppParams = { args: [] }): Promise<{ app: Application, menuAddon: SpectronMenuAddon}>{
  await fs.remove(Path.join(SPECTRON_BASEPATH, 'appState.json'));
  const app = menuAddon.createApplication({
    path: electronPath,
    env: { RUNNING_IN_SPECTRON: '1' },
    args: [...args, Path.join(__dirname, '../..')]
  });
  return {
    app,
    menuAddon
  };
}

export async function getApp({
  args = []
}: GetAppParams = { args: [] }): Promise<Application> {
  await fs.remove(Path.join(SPECTRON_BASEPATH, 'appState.json'));
  return new Application({
    path: electronPath,
    env: { RUNNING_IN_SPECTRON: '1' },
    args: [...args, Path.join(__dirname, '../..')]
  });
}
