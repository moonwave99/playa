import {
  OpenConfirmDialog,
  OpenFileDialog,
  OpenFolderDialog,
} from "@/types/types";

type DialogControllerParams = {
  openConfirmDialog: OpenConfirmDialog;
  openFolderDialog: OpenFolderDialog;
  openFileDialog: OpenFileDialog;
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
