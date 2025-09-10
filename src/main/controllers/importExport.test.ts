import { clearPrisma } from "@/test/prisma-utils";
import { seed, getData } from "@/test/seed";
import { mockFs } from "@/test/mock-fs";
import { withoutDates } from "@/test/utils";
import { importExportController } from "./importExport";
import { Open } from "unzipper";
import path from "node:path";
import { readJSON } from "fs-extra";

afterEach(clearPrisma);

describe("exportDataFromDialog function", () => {
  it("exports current data to a zip archive", async (context) => {
    await seed();
    const seeded = await getData();
    const directory = await mockFs(
      {
        Desktop: {
          dumpFolder: {},
        },
        UserData: {},
      },
      context.task.id
    );

    const userDataPath = path.join(directory, "UserData");

    const send = vi.fn();
    const openFileDialog = vi.fn();
    const openFolderDialog = () => [path.join(directory, "Desktop/dumpFolder")];

    const { exportDataFromDialog } = importExportController({
      openFolderDialog,
      openFileDialog,
      desktopPath: path.join(directory, "Desktop"),
      userDataPath,
      appVersion: "0.5",
      send,
    });

    const archivePath = await exportDataFromDialog();
    const outputPath = path.join(
      userDataPath,
      "imports",
      path.basename(archivePath)
    );

    await unzip({
      archivePath,
      outputPath,
    });

    await Promise.all(
      Object.keys(seeded).map(async (entity: keyof typeof seeded) => {
        const exported = await readJSON(
          path.join(outputPath, `${entity}.json`)
        );
        expect(exported.map(withoutDates)).toMatchObject(
          seeded[entity].map(withoutDates)
        );
      })
    );
  });
});

describe("importDataFromDialog function", () => {
  it("imports data from an archive", async (context) => {
    await seed();
    const directory = await mockFs(
      {
        Desktop: {
          dumpFolder: {},
        },
        UserData: {},
      },
      context.task.id
    );

    const userDataPath = path.join(directory, "UserData");

    const send = vi.fn();
    const openFileDialog = vi.fn();
    const openFolderDialog = () => [path.join(directory, "Desktop/dumpFolder")];

    const { importDataFromDialog, exportDataFromDialog } =
      importExportController({
        openFolderDialog,
        openFileDialog,
        desktopPath: path.join(directory, "Desktop"),
        userDataPath,
        appVersion: "0.5",
        send,
      });

    const archivePath = await exportDataFromDialog();
    const outputPath = path.join(
      userDataPath,
      "imports",
      path.basename(archivePath)
    );

    openFileDialog.mockReturnValueOnce(archivePath);

    await unzip({
      archivePath,
      outputPath,
    });

    await importDataFromDialog();

    const data = await getData();
    const entities = Object.keys(data);
    await Promise.all(
      entities.map(async (entity: keyof typeof data) => {
        expect(data[entity].map(withoutDates)).toMatchObject(
          data[entity].map(withoutDates)
        );
      })
    );

    [
      ...entities.flatMap((x) =>
        ["Clearing", "Importing"].map((y) => `${y} ${x}`)
      ),
      "Importing additional relationships",
    ].forEach((x) => {
      expect(send).toHaveBeenCalledWith("importData:progress", x, false);
      expect(send).toHaveBeenCalledWith("importData:progress", x, true);
    });
    expect(send).toHaveBeenCalledWith("importData:progress", "done", false);
  });
});

type UnzipParams = {
  archivePath: string;
  outputPath: string;
};
async function unzip({ archivePath, outputPath }: UnzipParams) {
  const unzipped = await Open.file(archivePath);
  await unzipped.extract({ path: outputPath });
}
