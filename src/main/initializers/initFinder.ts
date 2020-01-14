import { ipcMain as ipc } from 'electron';
import Finder from '../Finder';
import { IPC_MESSAGES } from '../../constants';

const {
  IPC_SYS_REVEAL_IN_FINDER,
} = IPC_MESSAGES;

export default function initFinder(rootFolder: string): void {
  const finder = new Finder(rootFolder);
  ipc.on(IPC_SYS_REVEAL_IN_FINDER, (_event, album) => {
    finder.reveal(album);
  });
}
