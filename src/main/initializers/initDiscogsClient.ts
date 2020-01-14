import { ipcMain as ipc } from 'electron';
import * as Path from 'path';
import DiscogsClient from '../discogsClient';
import { IPC_MESSAGES } from '../../constants';

const {
  IPC_COVER_GET_REQUEST,
  IPC_COVER_GET_RESPONSE,
} = IPC_MESSAGES;

type initDiscogsClientParams = {
  userDataPath: string;
  appName: string;
  appVersion: string;
  discogsKey: string;
  discogsSecret: string;
  disableRequests?: boolean;
}

export default function initDiscogsClient({
  userDataPath,
  appName,
  appVersion,
  discogsKey,
  discogsSecret,
  disableRequests = false
}: initDiscogsClientParams): void {
  const coversPath = Path.join(userDataPath, 'new_covers');
  const discogsClient = new DiscogsClient(
    coversPath,
    `${appName}/${appVersion}`,
    { consumerKey: discogsKey, consumerSecret: discogsSecret },
    disableRequests
  );

  ipc.on(IPC_COVER_GET_REQUEST, async (event, album) => {
    try {
      const { artist, title, _id } = album;
      const imagePath = await discogsClient.getAlbumCover(artist, title, _id);
      event.reply(IPC_COVER_GET_RESPONSE, imagePath, album);
    } catch (error) {
      event.reply('error', error);
    }
  });
}
