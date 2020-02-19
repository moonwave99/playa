import { ipcMain as ipc } from 'electron';
import * as Path from 'path';
import DiscogsClient from '../lib/discogsClient';
import { IPC_MESSAGES } from '../../constants';

const {
  IPC_COVER_GET_REQUEST,
} = IPC_MESSAGES;

type initDiscogsClientParams = {
  userDataPath: string;
  appName: string;
  appVersion: string;
  discogsKey: string;
  discogsSecret: string;
  disabled?: boolean;
  debug?: boolean;
}

export default function initDiscogsClient({
  userDataPath,
  appName,
  appVersion,
  discogsKey,
  discogsSecret,
  disabled = false,
  debug = false
}: initDiscogsClientParams): void {
  const coversPath = Path.join(userDataPath, 'new_covers');
  const discogsClient = new DiscogsClient({
    coversPath,
    userAgent: `${appName}/${appVersion}`,
    credentials: {
      consumerKey: discogsKey,
      consumerSecret: discogsSecret
    },
    disabled,
    debug
  });

  ipc.handle(IPC_COVER_GET_REQUEST, async (_event, { artist, title, _id }) =>
    await discogsClient.getAlbumCover(artist, title, _id)
  );
}
