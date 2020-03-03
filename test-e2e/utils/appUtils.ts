const electronPath = require('electron');
import * as Path from 'path';
import { Application } from 'spectron';

export const TEN_SECONDS = 10000;

type GetAppParams = {
  args: string[]
};

export function getApp({ args }: GetAppParams = { args: [] }): Application {
  return  new Application({
    path: electronPath,
    env: { RUNNING_IN_SPECTRON: '1' },
    args: [...args, Path.join(__dirname, '../..')]
  });
}
