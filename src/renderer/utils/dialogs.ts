import { ipcRenderer as ipc } from 'electron';
import { IPC_MESSAGES } from '../../constants';

const { IPC_DIALOG_SHOW_MESSAGE } = IPC_MESSAGES;

type ConfirmDialogOptions = {
  title: string;
  message: string;
}

const CONFIRM_DIALOG_BUTTONS = ['OK', 'Cancel'];

export async function confirmDialog({
  title,
  message,
}: ConfirmDialogOptions): Promise<boolean> {
  const { response } = await ipc.invoke(IPC_DIALOG_SHOW_MESSAGE, {
    title,
    message,
    type: 'warning',
    buttons: CONFIRM_DIALOG_BUTTONS,
    defaultId: 1,
    cancelId: 1
  });
  return response === 0;
}
