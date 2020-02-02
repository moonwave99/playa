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
  disableRequests?: boolean;
  debug?: boolean;
}

export default function initDiscogsClient({
  userDataPath,
  appName,
  appVersion,
  discogsKey,
  discogsSecret,
  disableRequests = false,
  debug = false
}: initDiscogsClientParams): void {
  const coversPath = Path.join(userDataPath, 'new_covers');
  const discogsClient = new DiscogsClient(
    coversPath,
    `${appName}/${appVersion}`,
    { consumerKey: discogsKey, consumerSecret: discogsSecret },
    disableRequests,
    debug
  );

  ipc.handle(IPC_COVER_GET_REQUEST, async (_event, { artist, title, _id }) =>
    await discogsClient.getAlbumCover(artist, title, _id)
  );
}
