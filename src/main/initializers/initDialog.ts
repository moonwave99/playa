import { ipcMain as ipc, dialog } from 'electron';
import { IPC_MESSAGES } from '../../constants';

const {
  IPC_DIALOG_SHOW_MESSAGE,
  IPC_DIALOG_SELECT_FOLDER
} = IPC_MESSAGES;

export default function initDialog(): void {
  ipc.handle(IPC_DIALOG_SHOW_MESSAGE, async (_event, options) => {
    return dialog.showMessageBox(options);
  });

  ipc.handle(IPC_DIALOG_SELECT_FOLDER, async () => {
    return await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
  });
}
