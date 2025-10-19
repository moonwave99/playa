import { app, type OpenDialogSyncOptions } from "electron";
import { importData, exportData } from "../db/importExport";
import type { send, openModal } from "./init";
import { wait } from "@/lib/utils";

type ImportExportControllerParams = {
  openFolderDialog: (
    defaultPath: string,
    properties: OpenDialogSyncOptions["properties"]
  ) => string[];
  openFileDialog: (
    defaultPath: string,
    filters: OpenDialogSyncOptions["filters"]
  ) => string;
  desktopPath: string;
  userDataPath: string;
  appVersion: string;
  send: typeof send;
  openModal: typeof openModal;
};

const ON_DONE_DELAY = 5000;

function getDelay() {
  if (process.env.NODE_ENV === "test") {
    return 0;
  }
  return ON_DONE_DELAY;
}

export function importExportController({
  openFolderDialog,
  openFileDialog,
  desktopPath,
  userDataPath,
  appVersion,
  send,
  openModal,
}: ImportExportControllerParams) {
  async function importDataFromDialog() {
    const file = openFileDialog(desktopPath, [
      {
        name: "Zip Files",
        extensions: ["zip"],
      },
    ]);
    if (!file) {
      return;
    }

    try {
      await importData({
        inputPath: file,
        userDataPath,
        appVersion,
        onProgress: (step, completed = false) =>
          send("importProgress", step, completed),
      });
      await wait(getDelay());
      app.relaunch();
      app.exit();
    } catch (error) {
      send("importError", error.message);
    }
  }

  async function exportDataFromDialog() {
    const outputPath = openFolderDialog(desktopPath, [
      "openDirectory",
      "createDirectory",
    ])[0];
    if (!outputPath) {
      return;
    }

    openModal("exportData");

    await wait(300);

    send("exportProgress", "start");

    const exportPath = await exportData({
      userDataPath,
      outputPath,
      appVersion,
    });

    send("exportProgress", "done");

    return exportPath;
  }

  return {
    importDataFromDialog,
    exportDataFromDialog,
  };
}

export const actions: (keyof ReturnType<typeof importExportController>)[] = [
  "importDataFromDialog",
  "exportDataFromDialog",
];
