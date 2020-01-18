import { History } from "history";
import { ipcRenderer as ipc } from 'electron';

import { IPC_MESSAGES } from '../../constants';

const {
  IPC_ERROR,
  IPC_UI_NAVIGATE_TO
} = IPC_MESSAGES;


export default function initIpc(history: History): void {
  ipc.on(IPC_ERROR, (_event, error) => {
    console.log(error);
  });

  ipc.on(IPC_UI_NAVIGATE_TO, (_event, path: string) => {
    history.replace(path);
  });
}
