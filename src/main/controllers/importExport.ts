import { app, type OpenDialogSyncOptions } from "electron";
import { importData, exportData } from "../db/importExport";
import { send } from "./init";
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
};

const ON_DONE_DELAY = 5000;

export function importExportController({
  openFolderDialog,
  openFileDialog,
  desktopPath,
  userDataPath,
  appVersion,
  send,
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
          send("importData:progress", step, completed),
      });
      await wait(ON_DONE_DELAY);
      app.relaunch();
      app.exit();
    } catch (error) {
      send("importData:error", error.message);
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

    return await exportData({
      userDataPath,
      outputPath,
      appVersion,
    });
  }
  return {
    importDataFromDialog,
    exportDataFromDialog,
  };
}

export const actions = ["importDataFromDialog", "exportDataFromDialog"];
