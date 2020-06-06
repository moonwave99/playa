const electronPath = require('electron');
import menuAddon, { SpectronMenuAddon } from 'spectron-menu-addon';
import * as Path from 'path';
import * as fs from 'fs-extra';
import { Application } from 'spectron';
import { defaultState } from '../../src/main/lib/appState';

export const SPECTRON_BASEPATH = Path.join(process.cwd(), '.spectron');
export const TEN_SECONDS = 10000;

type GetAppParams = {
  args: string[];
  state: object;
};

const defaultAppParams = {
  args: [],
  state: { showOnboarding: false }
} as GetAppParams;

export async function getApp(params = defaultAppParams): Promise<{
  app: Application;
  menuAddon: SpectronMenuAddon;
}>{
  const { state, args } = {
    ...defaultAppParams,
    ...params
  };
  await fs.writeJSON(
    Path.join(SPECTRON_BASEPATH, 'appState.json'),
    { ...defaultState, ...state }
  );
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
