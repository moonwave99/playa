import { ipcMain as ipc } from 'electron';
import { reveal } from '../finder';
import { IPC_MESSAGES } from '../../constants';

const {
  IPC_SYS_REVEAL_IN_FINDER,
} = IPC_MESSAGES;

export default function initFinder(): void {
  ipc.on(IPC_SYS_REVEAL_IN_FINDER, (_event, path) => {
    reveal(path);
  });
}
