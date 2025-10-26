import { app } from "electron";
import { importData, exportData } from "../db/importExport";
import { wait } from "@/lib/utils";
import {
  OpenFileDialog,
  OpenFolderDialog,
  Send,
  OpenModal,
} from "@/types/types";
import { ON_IMPORT_DONE_DELAY } from "@/constants";

type ImportExportControllerParams = {
  openFolderDialog: OpenFolderDialog;
  openFileDialog: OpenFileDialog;
  send: Send;
  openModal: OpenModal;
  desktopPath: string;
  userDataPath: string;
  appVersion: string;
};

function getDelay() {
  if (process.env.NODE_ENV === "test") {
    return 0;
  }
  return ON_IMPORT_DONE_DELAY;
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
    const file = openFileDialog({
      key: "importZipArchive",
      defaultPath: desktopPath,
      filters: [
        {
          name: "Zip Files",
          extensions: ["zip"],
        },
      ],
    });

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
    const outputPath = openFolderDialog({
      key: "outputExport",
      defaultPath: desktopPath,
      properties: ["openDirectory", "createDirectory"],
    })[0];
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
