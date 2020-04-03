import { ipcMain as ipc } from 'electron';
import * as Path from 'path';
import DiscogsClient, { DISCOGS_VARIOUS_ARTISTS_ID } from '../lib/discogsClient';
import { IPC_MESSAGES } from '../../constants';
import { Album } from '../../renderer/store/modules/album';
import { Artist } from '../../renderer/store/modules/artist';

const {
  IPC_COVER_GET_REQUEST,
  IPC_COVER_GET_FROM_URL_REQUEST,
  IPC_ARTIST_PICTURE_GET_REQUEST,
  IPC_ARTIST_PICTURE_GET_FROM_URL_REQUEST
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
  const coversPath = Path.join(userDataPath, 'covers');
  const artistPicturesPath = Path.join(userDataPath, 'artistPictures');
  const discogsClient = new DiscogsClient({
    coversPath,
    artistPicturesPath,
    userAgent: `${appName}/${appVersion}`,
    credentials: {
      consumerKey: discogsKey,
      consumerSecret: discogsSecret
    },
    disabled,
    debug
  });

  ipc.handle(IPC_COVER_GET_REQUEST, async (
    _event,
    { title, _id, isAlbumFromVA }: Album,
    { name }: Artist
  ) =>
    await discogsClient.getAlbumCover(isAlbumFromVA ? DISCOGS_VARIOUS_ARTISTS_ID : name, title, _id)
  );

  ipc.handle(IPC_COVER_GET_FROM_URL_REQUEST, async (_event, { _id }, url) =>
    await discogsClient.getAlbumCoverFromURL(_id, url)
  );

  ipc.handle(IPC_ARTIST_PICTURE_GET_REQUEST, async (
    _event,
    { _id, name }: Artist
  ) =>
    await discogsClient.getArtistPicture(name, _id)
  );

  ipc.handle(IPC_ARTIST_PICTURE_GET_FROM_URL_REQUEST, async (_event, { _id }, url) =>
    await discogsClient.getArtistPictureFromURL(_id, url)
  );
}
