import { type OpenDialogSyncOptions } from "electron";

type DialogControllerParams = {
  openConfirmDialog: (message: string, detail: string) => boolean;
  openFolderDialog: (
    defaultPath: string,
    properties: OpenDialogSyncOptions["properties"]
  ) => string[];
  openFileDialog: (
    defaultPath: string,
    filters: OpenDialogSyncOptions["filters"]
  ) => string;
};

export function dialogController({
  openConfirmDialog,
  openFolderDialog,
  openFileDialog,
}: DialogControllerParams) {
  return {
    openConfirmDialog,
    openFolderDialog,
    openFileDialog,
  };
}

export const actions: (keyof ReturnType<typeof dialogController>)[] = [
  "openConfirmDialog",
  "openFolderDialog",
  "openFileDialog",
];
