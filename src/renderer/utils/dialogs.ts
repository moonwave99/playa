import { ipcRenderer as ipc } from 'electron';
import { IPC_MESSAGES } from '../../constants';

const { IPC_DIALOG_SHOW_MESSAGE } = IPC_MESSAGES;

type ConfirmDialogOptions = {
  title: string;
  message: string;
  type?: string;
  buttons?: string[];
  defaultId?: number;
  cancelId?: number;
}

const CONFIRM_DIALOG_BUTTONS = ['OK', 'Cancel'];

export async function confirmDialog({
  title,
  message,
  type = 'warning',
  buttons = CONFIRM_DIALOG_BUTTONS,
  defaultId = 1,
  cancelId = 1
}: ConfirmDialogOptions): Promise<boolean> {
  const { response } = await ipc.invoke(IPC_DIALOG_SHOW_MESSAGE, {
    title,
    message,
    type,
    buttons,
    defaultId,
    cancelId
  });
  return response === 0;
}
