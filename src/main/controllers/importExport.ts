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
          send("import:progress", step, completed),
      });
      await wait(getDelay());
      app.relaunch();
      app.exit();
    } catch (error) {
      send("import:error", error.message);
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

    send("exportData", "start");

    const exportPath = await exportData({
      userDataPath,
      outputPath,
      appVersion,
    });

    send("exportData", "done");

    return exportPath;
  }

  return {
    importDataFromDialog,
    exportDataFromDialog,
  };
}

export const actions = ["importDataFromDialog", "exportDataFromDialog"];
